(function () {

    const chatInner = document.getElementById('chatInner');
    const chatScroll = document.getElementById('chatScroll');
    let emptyState = document.getElementById('emptyState');

    const composer = document.getElementById('composer');
    const sendBtn = document.getElementById('sendBtn');

    const appShell = document.querySelector('.app-shell');
    const sidebar = document.getElementById('sidebar');
    const sidebarList = document.getElementById('sidebarList');
    const newChatBtn = document.getElementById('newChatBtn');
    const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const sidebarScrim = document.getElementById('sidebarScrim');

    const themeToggle = document.getElementById('themeToggle');
    const themeToggleLabel = document.getElementById('themeToggleLabel');

    const STORAGE_KEY = 'chatbot_sessions';
    const CURRENT_KEY = 'chatbot_current_session';
    const THEME_KEY = 'chatbot_theme';

    // ---------------------------------------------------------
    // THEME (dark / light)
    // ---------------------------------------------------------
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        themeToggleLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }

    function initTheme() {
        let theme = localStorage.getItem(THEME_KEY);

        if (!theme) {
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }

        applyTheme(theme);
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';

        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    });

    initTheme();


    // ---------------------------------------------------------
    // SESSION STORAGE
    // ---------------------------------------------------------
    function loadSessions() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    function saveSessions(sessions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    function makeId() {
        return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    let sessions = loadSessions();
    let currentId = localStorage.getItem(CURRENT_KEY);

    if (!currentId || !sessions.find(s => s.id === currentId)) {
        if (sessions.length > 0) {
            currentId = sessions[0].id;
        } else {
            currentId = null;
        }
    }

    // In-memory alias for the active session's history (kept for backend call shape)
    let history = [];

    function getCurrentSession() {
        return sessions.find(s => s.id === currentId) || null;
    }

    function persistCurrent() {
        const s = getCurrentSession();
        if (s) {
            s.history = history;
            saveSessions(sessions);
        }
        if (currentId) {
            localStorage.setItem(CURRENT_KEY, currentId);
        }
    }


    // ---------------------------------------------------------
    // SIDEBAR RENDERING
    // ---------------------------------------------------------
    function renderSidebar() {
        sidebarList.innerHTML = '';

        if (sessions.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'sidebar-empty';
            empty.textContent = 'No chats yet';
            sidebarList.appendChild(empty);
            return;
        }

        // Most recently updated first
        const ordered = [...sessions].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        ordered.forEach(session => {
            const item = document.createElement('div');
            item.className = 'chat-item' + (session.id === currentId ? ' active' : '');
            item.dataset.id = session.id;

            const title = document.createElement('span');
            title.className = 'chat-item-title';
            title.textContent = session.title || 'New chat';

            const del = document.createElement('button');
            del.className = 'chat-item-delete';
            del.type = 'button';
            del.setAttribute('aria-label', 'Delete chat');
            del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

            del.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSession(session.id);
            });

            item.appendChild(title);
            item.appendChild(del);

            item.addEventListener('click', () => {
                switchSession(session.id);
                closeSidebarOnMobile();
            });

            sidebarList.appendChild(item);
        });
    }


    // ---------------------------------------------------------
    // CHAT RENDERING (for a loaded session)
    // ---------------------------------------------------------
    function renderChatFromHistory() {
        chatInner.innerHTML = '';
        emptyState = null;

        if (history.length === 0) {
            showEmptyState();
            return;
        }

        history.forEach(item => {
            if (item.role === 'user') {
                renderMessage('user', item.content);
            } else {
                const wrap = renderMessage('bot', '');
                wrap.querySelector('.bubble').innerHTML = formatMarkdown(item.content);
            }
        });
    }

    function showEmptyState() {
        const fresh = document.createElement('div');
        fresh.className = 'empty-state';
        fresh.id = 'emptyState';
        fresh.innerHTML = `
            <h1>Say something</h1>
            <p>
                I am here to respond to your message.
                <br>
                How is your day!?
            </p>
        `;
        chatInner.appendChild(fresh);
        emptyState = fresh;
    }


    // ---------------------------------------------------------
    // SESSION LIFECYCLE
    // ---------------------------------------------------------
    function createNewChat() {
        const session = {
            id: makeId(),
            title: 'New chat',
            history: [],
            updatedAt: Date.now()
        };

        sessions.unshift(session);
        currentId = session.id;
        history = [];

        saveSessions(sessions);
        localStorage.setItem(CURRENT_KEY, currentId);

        renderSidebar();
        renderChatFromHistory();
        composer.focus();
    }

    function switchSession(id) {
        if (id === currentId) return;

        const session = sessions.find(s => s.id === id);
        if (!session) return;

        currentId = id;
        history = Array.isArray(session.history) ? session.history : [];

        localStorage.setItem(CURRENT_KEY, currentId);

        renderSidebar();
        renderChatFromHistory();
        composer.focus();
    }

    function deleteSession(id) {
        sessions = sessions.filter(s => s.id !== id);
        saveSessions(sessions);

        if (id === currentId) {
            if (sessions.length > 0) {
                currentId = sessions[0].id;
                history = Array.isArray(sessions[0].history) ? sessions[0].history : [];
                localStorage.setItem(CURRENT_KEY, currentId);
            } else {
                currentId = null;
                history = [];
                localStorage.removeItem(CURRENT_KEY);
            }
            renderChatFromHistory();
        }

        renderSidebar();
    }

    function ensureSessionExists() {
        if (!currentId || !getCurrentSession()) {
            createNewChat();
        } else {
            history = Array.isArray(getCurrentSession().history)
                ? getCurrentSession().history
                : [];
        }
    }


    // ---------------------------------------------------------
    // BACKEND CONNECTION
    // ---------------------------------------------------------
    async function getBotResponse(message, history) {

        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message,
                history: history
            })
        });

        if (!response.ok) {
            throw new Error("Backend request failed");
        }

        const data = await response.json();

        return data.reply;
    }


    // ---------------------------------------------------------
    // SCROLL TO BOTTOM
    // ---------------------------------------------------------
    function scrollToBottom() {
        chatScroll.scrollTop = chatScroll.scrollHeight;
    }


    // ---------------------------------------------------------
    // MARKDOWN -> HTML (basic, safe subset)
    // ---------------------------------------------------------
    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function formatMarkdown(raw) {
        let text = escapeHtml(raw);

        // Fenced code blocks ```code```
        const blocks = [];
        text = text.replace(/```([a-zA-Z0-9]*)\n?([\s\S]*?)```/g, (m, lang, code) => {
            blocks.push('<pre><code>' + code.trim() + '</code></pre>');
            return '\u0000' + (blocks.length - 1) + '\u0000';
        });

        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold / italic
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

        // Split into blocks by blank lines, turn bullet groups into <ul>
        const parts = text.split(/\n{2,}/).map(chunk => {
            const lines = chunk.split('\n');
            const isList = lines.every(l => /^\s*[-*]\s+/.test(l.trim()) || l.trim() === '');
            if (isList && lines.some(l => l.trim() !== '')) {
                const items = lines
                    .filter(l => l.trim() !== '')
                    .map(l => '<li>' + l.replace(/^\s*[-*]\s+/, '') + '</li>')
                    .join('');
                return '<ul>' + items + '</ul>';
            }
            return '<p>' + chunk.replace(/\n/g, '<br>') + '</p>';
        });

        let html = parts.join('');

        // Restore code blocks
        html = html.replace(/\u0000(\d+)\u0000/g, (m, i) => blocks[Number(i)]);

        return html;
    }


    // ---------------------------------------------------------
    // RENDER MESSAGE
    // ---------------------------------------------------------
    function renderMessage(role, content) {

        if (emptyState) {
            emptyState.remove();
            emptyState = null;
        }

        const wrap = document.createElement('div');

        wrap.className =
            'msg ' + (role === 'user' ? 'user' : 'bot');


        const label = document.createElement('div');

        label.className = 'msg-label';

        label.textContent =
            role === 'user' ? 'You' : 'Chatbot';


        const bubble = document.createElement('div');

        bubble.className = 'bubble';

        bubble.textContent = content;


        wrap.appendChild(label);
        wrap.appendChild(bubble);

        chatInner.appendChild(wrap);

        scrollToBottom();

        return wrap;
    }


    // ---------------------------------------------------------
    // STREAM BOT REPLY (typewriter effect, then formats as markdown)
    // ---------------------------------------------------------
    function streamBotMessage(content) {
        if (emptyState) {
            emptyState.remove();
            emptyState = null;
        }

        const wrap = document.createElement('div');
        wrap.className = 'msg bot';

        const label = document.createElement('div');
        label.className = 'msg-label';
        label.textContent = 'Chatbot';

        const bubble = document.createElement('div');
        bubble.className = 'bubble';

        const cursor = document.createElement('span');
        cursor.className = 'cursor-blink';

        bubble.appendChild(cursor);
        wrap.appendChild(label);
        wrap.appendChild(bubble);
        chatInner.appendChild(wrap);
        scrollToBottom();

        return new Promise(resolve => {
            const words = content.split(/(\s+)/); // keep whitespace tokens
            let i = 0;

            function tick() {
                if (i < words.length) {
                    bubble.insertBefore(
                        document.createTextNode(words[i]),
                        cursor
                    );
                    i++;
                    scrollToBottom();
                    // vary speed slightly so it feels natural
                    setTimeout(tick, 15 + Math.random() * 20);
                } else {
                    // swap plain text for formatted markdown
                    bubble.innerHTML = formatMarkdown(content);
                    resolve(wrap);
                }
            }

            tick();
        });
    }


    // ---------------------------------------------------------
    // TYPING INDICATOR
    // ---------------------------------------------------------
    function renderTyping() {

        const wrap = document.createElement('div');

        wrap.className = 'msg bot';

        wrap.id = 'typingIndicator';


        const label = document.createElement('div');

        label.className = 'msg-label';

        label.textContent = 'Chatbot';


        const typing = document.createElement('div');

        typing.className = 'typing';

        typing.innerHTML =
            '<span></span><span></span><span></span>';


        wrap.appendChild(label);
        wrap.appendChild(typing);

        chatInner.appendChild(wrap);

        scrollToBottom();
    }


    // ---------------------------------------------------------
    // REMOVE TYPING INDICATOR
    // ---------------------------------------------------------
    function removeTyping() {

        const el =
            document.getElementById('typingIndicator');

        if (el) {
            el.remove();
        }
    }


    // ---------------------------------------------------------
    // AUTO GROW TEXTAREA
    // ---------------------------------------------------------
    function autoGrow() {

        composer.style.height = 'auto';

        composer.style.height =
            Math.min(composer.scrollHeight, 140) + 'px';
    }


    // ---------------------------------------------------------
    // SEND MESSAGE
    // ---------------------------------------------------------
    async function handleSend() {

        const text = composer.value.trim();

        if (!text || sendBtn.disabled) {
            return;
        }

        ensureSessionExists();

        // Clear input
        composer.value = '';

        autoGrow();

        sendBtn.disabled = true;


        // Show user message
        renderMessage('user', text);


        // Add user message to history
        history.push({
            role: 'user',
            content: text
        });

        // Title the session after the first message
        const session = getCurrentSession();
        if (session && (session.title === 'New chat' || !session.title)) {
            session.title = text.length > 40 ? text.slice(0, 40) + '…' : text;
        }
        if (session) session.updatedAt = Date.now();
        persistCurrent();
        renderSidebar();


        // Show typing animation
        renderTyping();


        try {

            // Send message to backend
            const reply =
                await getBotResponse(text, history);


            // Remove typing animation
            removeTyping();


            // Show bot response with a Gemini-style typewriter reveal
            await streamBotMessage(reply);


            // Add bot response to history
            history.push({
                role: 'bot',
                content: reply
            });

            if (session) session.updatedAt = Date.now();
            persistCurrent();

        }

        catch (error) {

            removeTyping();

            const el = renderMessage(
                'bot',
                'Something went wrong connecting to the server.'
            );

            el.classList.add('error');

            console.error(
                'Backend error:',
                error
            );
        }


        finally {

            sendBtn.disabled = false;

            composer.focus();
        }
    }


    // ---------------------------------------------------------
    // SEND BUTTON
    // ---------------------------------------------------------
    sendBtn.addEventListener(
        'click',
        handleSend
    );


    // ---------------------------------------------------------
    // ENTER TO SEND
    // SHIFT + ENTER = NEW LINE
    // ---------------------------------------------------------
    composer.addEventListener(
        'keydown',
        (e) => {

            if (
                e.key === 'Enter' &&
                !e.shiftKey
            ) {

                e.preventDefault();

                handleSend();
            }
        }
    );


    // ---------------------------------------------------------
    // TEXTAREA AUTO GROW
    // ---------------------------------------------------------
    composer.addEventListener(
        'input',
        autoGrow
    );


    // ---------------------------------------------------------
    // NEW CHAT BUTTON
    // ---------------------------------------------------------
    newChatBtn.addEventListener('click', () => {
        createNewChat();
        closeSidebarOnMobile();
    });


    // ---------------------------------------------------------
    // SIDEBAR OPEN / COLLAPSE (desktop collapse + mobile drawer)
    // ---------------------------------------------------------
    function isMobile() {
        return window.matchMedia('(max-width: 820px)').matches;
    }

    function openSidebarOnMobile() {
        sidebar.classList.add('open');
        sidebarScrim.classList.add('visible');
    }

    function closeSidebarOnMobile() {
        if (isMobile()) {
            sidebar.classList.remove('open');
            sidebarScrim.classList.remove('visible');
        }
    }

    sidebarOpenBtn.addEventListener('click', () => {
        if (isMobile()) {
            openSidebarOnMobile();
        } else {
            sidebar.classList.remove('collapsed');
            appShell.classList.remove('sidebar-collapsed');
        }
    });

    sidebarCollapseBtn.addEventListener('click', () => {
        if (isMobile()) {
            closeSidebarOnMobile();
        } else {
            sidebar.classList.add('collapsed');
            appShell.classList.add('sidebar-collapsed');
        }
    });

    sidebarScrim.addEventListener('click', closeSidebarOnMobile);


    // ---------------------------------------------------------
    // INITIALISE
    // ---------------------------------------------------------
    ensureSessionExists();
    renderSidebar();
    renderChatFromHistory();

    // Focus input when page loads
    composer.focus();

})();