/* ==========================================================================
   TELEPULCE WEB MESSENGER — CORE ENGINE & ARCHITECTURE
   Modern, Telegram-Inspired, Fast, Resilient, Real-Time Architecture
   ========================================================================== */

(function () {
  'use strict';

  /* ─── CONSTANTS & LOCAL STORAGE KEYS ───────────────────────────────────── */
  const STORE_KEY_USERS = 'telepulce_users_v3';
  const STORE_KEY_CHATS = 'telepulce_chats_v3';
  const STORE_KEY_MESSAGES = 'telepulce_messages_v3';
  const STORE_KEY_CURRENT_USER = 'telepulce_current_user_v3';
  const STORE_KEY_SETTINGS = 'telepulce_settings_v3';

  // Real-time inter-tab communication bus
  const realtimeBus = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('telepulce_realtime_sync') : null;

  /* ─── DEFAULT SEED DATA ────────────────────────────────────────────────── */
  const SEED_USERS = [
    {
      uid: 'user_navoiy',
      displayName: 'Alisher Navoiy',
      username: 'navoiy',
      email: 'navoiy@telepulse.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Shoir, mutafakkir va davlat arbobi.',
      online: true,
      lastSeen: 'hozir onlayn'
    },
    {
      uid: 'user_dilnoza',
      displayName: 'Dilnoza Rahimova',
      username: 'dilnoza_r',
      email: 'dilnoza@telepulse.app',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'UI/UX Dizayner & TelePulce ishqibozi ✨',
      online: true,
      lastSeen: 'hozir onlayn'
    },
    {
      uid: 'user_jamshid',
      displayName: 'Jamshidbek IT',
      username: 'jamshid_dev',
      email: 'jamshid@telepulse.app',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Full-stack Web & Mobile Developer 🚀',
      online: false,
      lastSeen: '14:20 da ko‘rilgan'
    },
    {
      uid: 'user_malika',
      displayName: 'Malika Karimova',
      username: 'malika_pm',
      email: 'malika@telepulse.app',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
      bio: 'Product Manager • Startup Enthusiast',
      online: true,
      lastSeen: 'hozir onlayn'
    }
  ];

  const SEED_CHATS = [
    {
      id: 'chat_group_devs',
      type: 'group',
      title: 'Dasturchilar Hamjamiyati 💻',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&h=200&q=80',
      description: 'O‘zbekiston IT jamoasi rasmiy suhbati. Zamonaviy web, mobile va AI texnologiyalar.',
      ownerId: 'user_jamshid',
      admins: ['user_jamshid', 'user_navoiy'],
      members: ['user_navoiy', 'user_dilnoza', 'user_jamshid', 'user_malika'],
      pinnedMessageId: 'msg_g3',
      unreadCount: 0,
      updatedAt: Date.now() - 30000,
      lastMessage: {
        text: 'TelePulce Web yangi talqiniga barchangiz xush kelibsiz! 🔥',
        senderId: 'user_jamshid',
        senderName: 'Jamshidbek IT',
        time: '14:32'
      }
    },
    {
      id: 'chat_channel_news',
      type: 'channel',
      title: 'TelePulce Rasmiy Yangiliklar 📢',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=200&q=80',
      description: 'TelePulce loyihasining so‘nggi yangiliklari, yangi imkoniyatlar va e’lonlar.',
      ownerId: 'user_jamshid',
      admins: ['user_jamshid'],
      subscribers: ['user_navoiy', 'user_dilnoza', 'user_jamshid', 'user_malika'],
      pinnedMessageId: null,
      unreadCount: 1,
      updatedAt: Date.now() - 60000,
      lastMessage: {
        text: '🚀 TelePulce Web 3.0 relizi ishga tushirildi! Telegram darajasidagi qulaylik va tezlik.',
        senderId: 'user_jamshid',
        senderName: 'TelePulce Yangiliklar',
        time: '14:28'
      }
    },
    {
      id: 'chat_saved_messages',
      type: 'saved',
      title: 'Saqlangan xabarlar 🔖',
      avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=Saved',
      description: 'Shaxsiy xotiralar, muhim eslatmalar, havolalar va saqlangan xabarlar.',
      ownerId: 'user_navoiy',
      pinnedMessageId: null,
      unreadCount: 0,
      updatedAt: Date.now() - 120000,
      lastMessage: {
        text: 'https://telepulce.netlify.app/ — yangi platforma havolasi',
        senderId: 'user_navoiy',
        senderName: 'Siz',
        time: '14:15'
      }
    },
    {
      id: 'chat_private_dilnoza',
      type: 'private',
      title: 'Dilnoza Rahimova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      description: 'UI/UX Dizayner',
      partnerId: 'user_dilnoza',
      pinnedMessageId: null,
      unreadCount: 0,
      updatedAt: Date.now() - 180000,
      lastMessage: {
        text: 'Yangi dizayn tizimi juda qulay va ixcham chiqibdi! 👍',
        senderId: 'user_dilnoza',
        senderName: 'Dilnoza Rahimova',
        time: '14:10'
      }
    },
    {
      id: 'chat_private_jamshid',
      type: 'private',
      title: 'Jamshidbek IT',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      description: 'Full-stack Developer',
      partnerId: 'user_jamshid',
      pinnedMessageId: null,
      unreadCount: 0,
      updatedAt: Date.now() - 360000,
      lastMessage: {
        text: 'Real-time WebSocket arxitekturasini ham tayyorlab qo‘ydim.',
        senderId: 'user_jamshid',
        senderName: 'Jamshidbek IT',
        time: '13:50'
      }
    }
  ];

  const SEED_MESSAGES = {
    'chat_group_devs': [
      {
        id: 'msg_g1',
        senderId: 'user_navoiy',
        senderName: 'Alisher Navoiy',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        text: 'Assalomu alaykum aziz hamkasblar! Barchangizga xayrli kun tilayman! 👋',
        type: 'text',
        time: '14:01',
        timestamp: Date.now() - 1800000,
        reactions: { '❤️': ['user_dilnoza'], '👍': ['user_jamshid'] },
        status: 'read'
      },
      {
        id: 'msg_g2',
        senderId: 'user_dilnoza',
        senderName: 'Dilnoza Rahimova',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
        text: 'Vaalaykum assalom! TelePulce messenjerining Telegram-uslubidagi toza interfeysi juda chiroyli va qulay bo‘libdi!',
        type: 'text',
        time: '14:05',
        timestamp: Date.now() - 1500000,
        reactions: { '🔥': ['user_navoiy', 'user_malika'] },
        status: 'read'
      },
      {
        id: 'msg_g3',
        senderId: 'user_jamshid',
        senderName: 'Jamshidbek IT',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
        text: 'TelePulce Web yangi talqiniga barchangiz xush kelibsiz! 🔥 Tezkor xabarlar, reaksiya, ovozli xabar, rasm-video va guruhlar mukammal ishlamoqda.',
        type: 'text',
        time: '14:32',
        timestamp: Date.now() - 30000,
        reactions: { '🎉': ['user_navoiy', 'user_dilnoza'] },
        status: 'read'
      }
    ],
    'chat_channel_news': [
      {
        id: 'msg_c1',
        senderId: 'user_jamshid',
        senderName: 'TelePulce Yangiliklar',
        senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=200&q=80',
        text: '🚀 TelePulce Web 3.0 relizi ishga tushirildi! Telegram darajasidagi qulaylik, zamonaviy ko‘k ranglar palitrasi, tungi va kunduzgi rejimlar va real-time xabar almashinuvi bilan tanishing.',
        type: 'text',
        time: '14:28',
        timestamp: Date.now() - 60000,
        reactions: { '🔥': ['user_navoiy', 'user_dilnoza', 'user_malika'] },
        status: 'read'
      }
    ],
    'chat_saved_messages': [
      {
        id: 'msg_s1',
        senderId: 'user_navoiy',
        senderName: 'Alisher Navoiy',
        text: 'Muhim eslatma: TelePulce loyihasi taqdimotini muvaffaqiyatli yakunlash va messenjer imkoniyatlarini amalda ko‘rsatish!',
        type: 'text',
        time: '14:12',
        timestamp: Date.now() - 130000,
        reactions: {},
        status: 'read'
      },
      {
        id: 'msg_s2',
        senderId: 'user_navoiy',
        senderName: 'Alisher Navoiy',
        text: 'https://telepulce.netlify.app/ — yangi platforma havolasi',
        type: 'text',
        time: '14:15',
        timestamp: Date.now() - 120000,
        reactions: {},
        status: 'read'
      }
    ],
    'chat_private_dilnoza': [
      {
        id: 'msg_d1',
        senderId: 'user_navoiy',
        senderName: 'Alisher Navoiy',
        text: 'Salom Dilnoza! Yangi dizayn bo‘yicha fikringiz qanday?',
        type: 'text',
        time: '14:08',
        timestamp: Date.now() - 200000,
        reactions: {},
        status: 'read'
      },
      {
        id: 'msg_d2',
        senderId: 'user_dilnoza',
        senderName: 'Dilnoza Rahimova',
        text: 'Yangi dizayn tizimi juda qulay va ixcham chiqibdi! 👍 Xabarlar ko‘rinishi ham Telegram kabi ravon va engil.',
        type: 'text',
        time: '14:10',
        timestamp: Date.now() - 180000,
        reactions: { '❤️': ['user_navoiy'] },
        status: 'read'
      }
    ],
    'chat_private_jamshid': [
      {
        id: 'msg_j1',
        senderId: 'user_jamshid',
        senderName: 'Jamshidbek IT',
        text: 'Real-time WebSocket arxitekturasini ham tayyorlab qo‘ydim.',
        type: 'text',
        time: '13:50',
        timestamp: Date.now() - 360000,
        reactions: { '👍': ['user_navoiy'] },
        status: 'read'
      }
    ]
  };

  /* ─── STICKER PACK DATA ────────────────────────────────────────────────── */
  const STICKER_PACK = [
    '🚀', '🔥', '🎉', '💡', '✨', '⚡', '💻', '❤️', '🌟', '🦄', '🤖', '🎯'
  ];

  const EMOJI_LIST = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔'
  ];

  /* ─── STORE OBJECT ─────────────────────────────────────────────────────── */
  const Store = {
    users: [],
    chats: [],
    messages: {},
    currentUser: null,
    settings: {
      theme: 'dark',
      accent: 'blue',
      fontSize: '15px',
      soundEnabled: true,
      language: 'uz'
    },

    init() {
      // 1. Users
      try {
        const u = localStorage.getItem(STORE_KEY_USERS);
        this.users = u ? JSON.parse(u) : SEED_USERS;
      } catch (e) {
        this.users = SEED_USERS;
      }

      // 2. Chats
      try {
        const c = localStorage.getItem(STORE_KEY_CHATS);
        this.chats = c ? JSON.parse(c) : SEED_CHATS;
      } catch (e) {
        this.chats = SEED_CHATS;
      }

      // 3. Messages
      try {
        const m = localStorage.getItem(STORE_KEY_MESSAGES);
        this.messages = m ? JSON.parse(m) : SEED_MESSAGES;
      } catch (e) {
        this.messages = SEED_MESSAGES;
      }

      // 4. Current User
      try {
        const cu = localStorage.getItem(STORE_KEY_CURRENT_USER);
        this.currentUser = cu ? JSON.parse(cu) : this.users[0];
      } catch (e) {
        this.currentUser = this.users[0];
      }

      // 5. Settings
      try {
        const s = localStorage.getItem(STORE_KEY_SETTINGS);
        if (s) this.settings = Object.assign(this.settings, JSON.parse(s));
      } catch (e) {}

      this.saveAll();
    },

    saveUsers() {
      localStorage.setItem(STORE_KEY_USERS, JSON.stringify(this.users));
    },

    saveChats() {
      localStorage.setItem(STORE_KEY_CHATS, JSON.stringify(this.chats));
    },

    saveMessages() {
      localStorage.setItem(STORE_KEY_MESSAGES, JSON.stringify(this.messages));
    },

    saveCurrentUser() {
      localStorage.setItem(STORE_KEY_CURRENT_USER, JSON.stringify(this.currentUser));
    },

    saveSettings() {
      localStorage.setItem(STORE_KEY_SETTINGS, JSON.stringify(this.settings));
    },

    saveAll() {
      this.saveUsers();
      this.saveChats();
      this.saveMessages();
      this.saveCurrentUser();
      this.saveSettings();
    },

    broadcast(type, payload) {
      if (realtimeBus) {
        realtimeBus.postMessage({ type, payload, senderUid: this.currentUser?.uid });
      }
    }
  };

  /* ─── WEB AUDIO API SOUND GENERATOR ────────────────────────────────────── */
  const SoundEffects = {
    audioCtx: null,

    init() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
    },

    playPop() {
      if (!Store.settings.soundEnabled) return;
      try {
        this.init();
        if (!this.audioCtx) return;
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        const now = this.audioCtx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5 note
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5 note

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }
  };

  /* ─── UI CONTROLLER & APP STATE ────────────────────────────────────────── */
  const App = {
    activeChatId: null,
    currentFilterTab: 'all',
    selectedMessageIds: new Set(),
    isMultiSelectMode: false,
    replyingMessage: null,
    editingMessage: null,
    contextTargetMessage: null,
    voiceRecordingTimer: null,
    voiceRecordingSeconds: 0,

    init() {
      Store.init();
      this.applyThemeAndSettings();
      this.bindDOM();
      this.setupRealtimeListener();
      this.renderSidebarChats();
      this.renderNavUser();

      // Open first chat on desktop by default
      if (window.innerWidth > 768 && Store.chats.length > 0) {
        this.openChat(Store.chats[0].id);
      }
    },

    /* ─── DOM BINDINGS ─────────────────────────────────────────────────── */
    bindDOM() {
      // 1. Sidebar Tabs
      const tabs = document.querySelectorAll('.chat-tab');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.currentFilterTab = tab.getAttribute('data-tab');
          this.renderSidebarChats();
        });
      });

      // 2. Global Search Input
      const searchInput = document.getElementById('global-search-input');
      const clearSearchBtn = document.getElementById('btn-clear-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const query = e.target.value.trim();
          if (clearSearchBtn) clearSearchBtn.style.display = query ? 'flex' : 'none';
          this.renderSidebarChats(query);
        });
      }
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          searchInput.value = '';
          clearSearchBtn.style.display = 'none';
          this.renderSidebarChats();
        });
      }

      // 3. Hamburger Menu & Nav Drawer
      const hamburgerBtn = document.getElementById('btn-hamburger');
      const navOverlay = document.getElementById('nav-drawer-overlay');
      if (hamburgerBtn && navOverlay) {
        hamburgerBtn.addEventListener('click', () => navOverlay.classList.add('active'));
        navOverlay.addEventListener('click', (e) => {
          if (e.target === navOverlay) navOverlay.classList.remove('active');
        });
      }

      // 4. Nav Drawer Actions
      document.getElementById('nav-btn-profile')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openEditProfileModal();
      });
      document.getElementById('nav-btn-saved-messages')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openChat('chat_saved_messages');
      });
      document.getElementById('nav-btn-new-group')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openNewGroupModal();
      });
      document.getElementById('nav-btn-new-channel')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openNewChannelModal();
      });
      document.getElementById('nav-btn-switch-user')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openSwitchUserModal();
      });
      document.getElementById('nav-btn-settings')?.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        this.openSettingsModal();
      });
      document.getElementById('nav-btn-toggle-theme')?.addEventListener('click', () => {
        const nextTheme = Store.settings.theme === 'dark' ? 'light' : 'dark';
        Store.settings.theme = nextTheme;
        Store.saveSettings();
        this.applyThemeAndSettings();
      });
      document.getElementById('nav-btn-logout')?.addEventListener('click', () => {
        if (confirm('TelePulce hisobingizdan chiqmoqchimisiz?')) {
          this.openSwitchUserModal();
        }
      });

      // 5. FAB New Chat
      document.getElementById('fab-new-chat')?.addEventListener('click', () => {
        this.openNewChatModal();
      });

      // 6. Mobile Back Button
      document.getElementById('btn-mobile-back')?.addEventListener('click', () => {
        document.body.classList.remove('chat-open');
      });

      // 7. Info Drawer Toggle
      const infoDrawer = document.getElementById('info-drawer');
      document.getElementById('btn-toggle-info-drawer')?.addEventListener('click', () => {
        if (!infoDrawer) return;
        const isShown = infoDrawer.style.display === 'flex';
        infoDrawer.style.display = isShown ? 'none' : 'flex';
        if (!isShown) this.renderInfoDrawer();
      });
      document.getElementById('btn-close-drawer')?.addEventListener('click', () => {
        if (infoDrawer) infoDrawer.style.display = 'none';
      });

      // 8. In-Chat Search
      const inChatSearchBtn = document.getElementById('btn-open-chat-search');
      const inChatSearchBar = document.getElementById('chat-search-bar');
      const inChatSearchInput = document.getElementById('in-chat-search-input');
      const inChatSearchClose = document.getElementById('btn-close-chat-search');

      if (inChatSearchBtn && inChatSearchBar) {
        inChatSearchBtn.addEventListener('click', () => {
          inChatSearchBar.style.display = 'flex';
          inChatSearchInput?.focus();
        });
      }
      if (inChatSearchClose && inChatSearchBar) {
        inChatSearchClose.addEventListener('click', () => {
          inChatSearchBar.style.display = 'none';
          if (inChatSearchInput) inChatSearchInput.value = '';
          this.renderMessages();
        });
      }
      if (inChatSearchInput) {
        inChatSearchInput.addEventListener('input', (e) => {
          this.renderMessages(e.target.value.trim());
        });
      }

      // 9. Input Textarea & Send / Mic button
      const msgInput = document.getElementById('message-input');
      const sendOrMicBtn = document.getElementById('btn-send-or-mic');
      const iconSendOrMic = document.getElementById('icon-send-or-mic');

      if (msgInput && sendOrMicBtn && iconSendOrMic) {
        msgInput.addEventListener('input', () => {
          // Auto resize height
          msgInput.style.height = 'auto';
          msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';

          const hasText = msgInput.value.trim().length > 0;
          if (hasText) {
            iconSendOrMic.className = 'fa-solid fa-paper-plane';
            sendOrMicBtn.title = 'Yuborish';
          } else {
            iconSendOrMic.className = 'fa-solid fa-microphone';
            sendOrMicBtn.title = 'Ovozli xabar';
          }
        });

        msgInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendAction();
          }
        });

        sendOrMicBtn.addEventListener('click', () => {
          this.handleSendAction();
        });
      }

      // 10. Voice recording handlers
      document.getElementById('btn-cancel-recording')?.addEventListener('click', () => {
        this.cancelVoiceRecording();
      });
      document.getElementById('btn-send-recording')?.addEventListener('click', () => {
        this.submitVoiceRecording();
      });

      // 11. Emoji & Sticker Popover Toggle
      const emojiBtn = document.getElementById('btn-emoji-toggle');
      const emojiPopover = document.getElementById('emoji-picker-popover');
      if (emojiBtn && emojiPopover) {
        emojiBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = emojiPopover.style.display !== 'flex';
          emojiPopover.style.display = isHidden ? 'flex' : 'none';
          if (isHidden) this.renderEmojiPicker('emojis');
        });
      }

      // Emoji/Sticker Tabs
      document.querySelectorAll('.picker-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.picker-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const type = btn.getAttribute('data-picker');
          this.renderEmojiPicker(type);
        });
      });

      // 12. Attachment Popover Toggle & File Inputs
      const attachBtn = document.getElementById('btn-attachment');
      const attachPopover = document.getElementById('attachment-popover');
      if (attachBtn && attachPopover) {
        attachBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = attachPopover.style.display !== 'flex';
          attachPopover.style.display = isHidden ? 'flex' : 'none';
        });
      }

      document.getElementById('file-input-image')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file, 'image');
        if (attachPopover) attachPopover.style.display = 'none';
      });
      document.getElementById('file-input-video')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file, 'video');
        if (attachPopover) attachPopover.style.display = 'none';
      });
      document.getElementById('file-input-doc')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.handleFileUpload(file, 'file');
        if (attachPopover) attachPopover.style.display = 'none';
      });
      document.getElementById('btn-send-round-video-item')?.addEventListener('click', () => {
        if (attachPopover) attachPopover.style.display = 'none';
        this.sendRoundVideoMessage();
      });

      // 13. Cancel Input Action (Reply or Edit)
      document.getElementById('btn-cancel-input-action')?.addEventListener('click', () => {
        this.clearInputAction();
      });

      // 14. Scroll to Bottom Button
      const messagesContainer = document.getElementById('messages-container');
      const scrollBottomBtn = document.getElementById('btn-scroll-bottom');
      if (messagesContainer && scrollBottomBtn) {
        messagesContainer.addEventListener('scroll', () => {
          const fromBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight;
          scrollBottomBtn.style.display = fromBottom > 150 ? 'flex' : 'none';
        });
        scrollBottomBtn.addEventListener('click', () => {
          this.scrollToBottom();
        });
      }

      // 15. Context Menu Interactions
      this.bindContextMenu();

      // 16. Modal Close Buttons
      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
          const modalId = btn.getAttribute('data-close-modal');
          const modal = document.getElementById(modalId);
          if (modal) modal.classList.remove('active');
        });
      });

      // 17. Multi-Select Actions
      document.getElementById('btn-cancel-selection')?.addEventListener('click', () => {
        this.exitMultiSelect();
      });
      document.getElementById('btn-delete-selected')?.addEventListener('click', () => {
        this.deleteSelectedMessages();
      });
      document.getElementById('btn-forward-selected')?.addEventListener('click', () => {
        this.openForwardModalForSelected();
      });

      // 18. Modals Submissions
      this.bindModalSubmissions();

      // Close popovers on body click
      document.addEventListener('click', (e) => {
        if (emojiPopover && !emojiPopover.contains(e.target) && e.target !== emojiBtn) {
          emojiPopover.style.display = 'none';
        }
        if (attachPopover && !attachPopover.contains(e.target) && e.target !== attachBtn) {
          attachPopover.style.display = 'none';
        }
        const ctxMenu = document.getElementById('message-context-menu');
        if (ctxMenu && !ctxMenu.contains(e.target)) {
          ctxMenu.style.display = 'none';
        }
      });
    },

    /* ─── REAL-TIME SYNC LISTENER ──────────────────────────────────────── */
    setupRealtimeListener() {
      if (realtimeBus) {
        realtimeBus.onmessage = (e) => {
          const { type, payload } = e.data;
          // Reload fresh data from storage
          Store.chats = JSON.parse(localStorage.getItem(STORE_KEY_CHATS) || '[]');
          Store.messages = JSON.parse(localStorage.getItem(STORE_KEY_MESSAGES) || '{}');

          if (type === 'new_message') {
            if (this.activeChatId === payload.chatId) {
              this.renderMessages();
              this.scrollToBottom();
            }
            this.renderSidebarChats();
            SoundEffects.playPop();
          } else if (type === 'edit_message' || type === 'delete_message' || type === 'reaction') {
            if (this.activeChatId === payload.chatId) {
              this.renderMessages();
            }
            this.renderSidebarChats();
          } else if (type === 'new_chat') {
            this.renderSidebarChats();
          }
        };
      }

      // Also listen to Storage event for multi-tab fallback
      window.addEventListener('storage', (e) => {
        if (e.key === STORE_KEY_CHATS || e.key === STORE_KEY_MESSAGES) {
          Store.chats = JSON.parse(localStorage.getItem(STORE_KEY_CHATS) || '[]');
          Store.messages = JSON.parse(localStorage.getItem(STORE_KEY_MESSAGES) || '{}');
          this.renderSidebarChats();
          if (this.activeChatId) this.renderMessages();
        }
      });
    },

    /* ─── THEME & SETTINGS ─────────────────────────────────────────────── */
    applyThemeAndSettings() {
      const s = Store.settings;
      document.documentElement.setAttribute('data-theme', s.theme || 'dark');
      document.documentElement.setAttribute('data-accent', s.accent || 'blue');
      document.documentElement.style.setProperty('--app-font-size', s.fontSize || '15px');

      // Update Nav drawer theme label
      const themeText = document.getElementById('nav-theme-text');
      const themeIcon = document.getElementById('nav-theme-icon');
      if (themeText) themeText.textContent = s.theme === 'dark' ? 'Kunduzgi rejim' : 'Tungi rejim';
      if (themeIcon) themeIcon.className = s.theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    },

    /* ─── SIDEBAR RENDERING ────────────────────────────────────────────── */
    renderSidebarChats(filterQuery = '') {
      const container = document.getElementById('chat-list-container');
      if (!container) return;

      let list = [...Store.chats];

      // Filter by Tab
      if (this.currentFilterTab === 'private') {
        list = list.filter(c => c.type === 'private');
      } else if (this.currentFilterTab === 'groups') {
        list = list.filter(c => c.type === 'group');
      } else if (this.currentFilterTab === 'channels') {
        list = list.filter(c => c.type === 'channel');
      } else if (this.currentFilterTab === 'saved') {
        list = list.filter(c => c.type === 'saved');
      }

      // Search Query Filter
      if (filterQuery) {
        const q = filterQuery.toLowerCase();
        list = list.filter(c => {
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchLast = c.lastMessage?.text?.toLowerCase().includes(q);
          return matchTitle || matchLast;
        });
      }

      // Sort by recent updatedAt
      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      if (list.length === 0) {
        container.innerHTML = `
          <div style="padding: 30px 16px; text-align: center; color: var(--text-muted); font-size: 13.5px;">
            <i class="fa-solid fa-comments" style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;"></i>
            <div>Hech qanday suhbat topilmadi</div>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map(chat => {
        const isActive = chat.id === this.activeChatId;
        const lastMsg = chat.lastMessage;
        let previewSender = '';
        if (lastMsg) {
          if (lastMsg.senderId === Store.currentUser?.uid) {
            previewSender = '<span class="preview-sender">Siz: </span>';
          } else if (chat.type === 'group' && lastMsg.senderName) {
            previewSender = `<span class="preview-sender">${this.escapeHTML(lastMsg.senderName)}: </span>`;
          }
        }

        const unreadBadge = chat.unreadCount > 0 ? `<span class="chat-item-badge">${chat.unreadCount}</span>` : '';
        const isOnline = chat.type === 'private' && chat.partnerId && this.getUserById(chat.partnerId)?.online;

        return `
          <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chat.id}">
            <div class="avatar-wrap">
              <img class="user-avatar-img" src="${chat.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + chat.id}" alt="${this.escapeHTML(chat.title)}">
              ${isOnline ? '<div class="online-dot"></div>' : ''}
            </div>
            <div class="chat-item-content">
              <div class="chat-item-top">
                <span class="chat-item-name">
                  ${chat.type === 'group' ? '<i class="fa-solid fa-users badge-group"></i>' : ''}
                  ${chat.type === 'channel' ? '<i class="fa-solid fa-bullhorn badge-channel"></i>' : ''}
                  ${chat.type === 'saved' ? '<i class="fa-solid fa-bookmark" style="color:var(--primary); font-size:12px;"></i>' : ''}
                  ${this.escapeHTML(chat.title)}
                </span>
                <span class="chat-item-time">${lastMsg?.time || ''}</span>
              </div>
              <div class="chat-item-bottom">
                <div class="chat-item-lastmsg">
                  ${previewSender}${this.escapeHTML(lastMsg?.text || 'Xabar yo‘q')}
                </div>
                <div class="chat-item-badges">
                  ${chat.pinnedMessageId ? '<i class="fa-solid fa-thumbtack pin-icon"></i>' : ''}
                  ${unreadBadge}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Add click listeners to chat items
      container.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
          const chatId = item.getAttribute('data-chat-id');
          this.openChat(chatId);
        });
      });
    },

    /* ─── OPEN CHAT ────────────────────────────────────────────────────── */
    openChat(chatId) {
      const chat = Store.chats.find(c => c.id === chatId);
      if (!chat) return;

      this.activeChatId = chatId;
      chat.unreadCount = 0;
      Store.saveChats();

      // Mobile slide into view
      document.body.classList.add('chat-open');

      // Update sidebar active item
      this.renderSidebarChats();

      // Show Chat View, Hide No-Chat Empty State
      const noChatView = document.getElementById('no-chat-view');
      const activeChatContainer = document.getElementById('active-chat-container');
      if (noChatView) noChatView.style.display = 'none';
      if (activeChatContainer) activeChatContainer.style.display = 'flex';

      // Update Header
      const headerAvatar = document.getElementById('active-chat-avatar');
      const headerOnlineDot = document.getElementById('active-chat-online-dot');
      const headerTitle = document.getElementById('active-chat-title');
      const headerStatus = document.getElementById('active-chat-status');

      if (headerAvatar) headerAvatar.src = chat.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + chat.id;
      if (headerTitle) headerTitle.textContent = chat.title;

      let statusText = 'onlayn';
      let isOnline = false;

      if (chat.type === 'private' && chat.partnerId) {
        const partner = this.getUserById(chat.partnerId);
        if (partner) {
          isOnline = partner.online;
          statusText = partner.online ? 'hozir onlayn' : (partner.lastSeen || 'oxirgi marta yaqinda ko‘rilgan');
        }
      } else if (chat.type === 'group') {
        const memberCount = (chat.members || []).length;
        statusText = `${memberCount} ta a‘zo`;
      } else if (chat.type === 'channel') {
        const subCount = (chat.subscribers || []).length;
        statusText = `${subCount} ta obunachi`;
      } else if (chat.type === 'saved') {
        statusText = 'shaxsiy bulut xotirasi';
      }

      if (headerStatus) {
        headerStatus.textContent = statusText;
        headerStatus.className = isOnline ? 'chat-header-status status-online' : 'chat-header-status';
      }
      if (headerOnlineDot) {
        headerOnlineDot.style.display = isOnline ? 'block' : 'none';
      }

      // Channel Read-Only or Group/Private Input mode
      const inputFormRow = document.getElementById('input-form-row');
      const channelReadonlyBar = document.getElementById('channel-readonly-bar');

      if (chat.type === 'channel') {
        const isAdmin = (chat.admins || []).includes(Store.currentUser?.uid);
        if (!isAdmin) {
          if (inputFormRow) inputFormRow.style.display = 'none';
          if (channelReadonlyBar) channelReadonlyBar.style.display = 'block';
        } else {
          if (inputFormRow) inputFormRow.style.display = 'flex';
          if (channelReadonlyBar) channelReadonlyBar.style.display = 'none';
        }
      } else {
        if (inputFormRow) inputFormRow.style.display = 'flex';
        if (channelReadonlyBar) channelReadonlyBar.style.display = 'none';
      }

      // Check Pinned Message
      this.updatePinnedBanner(chat);

      // Render Messages
      this.renderMessages();
      this.scrollToBottom();

      // Also update Info drawer if open
      const infoDrawer = document.getElementById('info-drawer');
      if (infoDrawer && infoDrawer.style.display === 'flex') {
        this.renderInfoDrawer();
      }
    },

    /* ─── PINNED BANNER ────────────────────────────────────────────────── */
    updatePinnedBanner(chat) {
      const banner = document.getElementById('pinned-banner');
      const bannerText = document.getElementById('pinned-text');
      const btnUnpin = document.getElementById('btn-unpin-banner');
      if (!banner) return;

      if (chat.pinnedMessageId) {
        const msgs = Store.messages[chat.id] || [];
        const pinnedMsg = msgs.find(m => m.id === chat.pinnedMessageId);
        if (pinnedMsg) {
          banner.style.display = 'flex';
          if (bannerText) bannerText.textContent = pinnedMsg.text || 'Media xabar';

          banner.onclick = (e) => {
            if (e.target.closest('#btn-unpin-banner')) return;
            const targetEl = document.getElementById(`msg-${pinnedMsg.id}`);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetEl.style.transition = 'background-color 0.4s';
              targetEl.style.backgroundColor = 'var(--primary-light)';
              setTimeout(() => targetEl.style.backgroundColor = '', 1200);
            }
          };

          if (btnUnpin) {
            btnUnpin.onclick = (e) => {
              e.stopPropagation();
              chat.pinnedMessageId = null;
              Store.saveChats();
              this.updatePinnedBanner(chat);
              this.showToast('Xabar pindan olindi');
            };
          }
          return;
        }
      }
      banner.style.display = 'none';
    },

    /* ─── RENDER MESSAGES ──────────────────────────────────────────────── */
    renderMessages(searchQuery = '') {
      const container = document.getElementById('messages-container');
      if (!container || !this.activeChatId) return;

      const msgs = Store.messages[this.activeChatId] || [];
      const currentChat = Store.chats.find(c => c.id === this.activeChatId);

      if (msgs.length === 0) {
        container.innerHTML = `
          <div style="margin: auto; text-align: center; color: var(--text-muted); font-size: 13.5px;">
            <i class="fa-solid fa-paper-plane" style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;"></i>
            <div>Ushbu chatda hali xabarlar yo‘q. Birinchi bo‘lib yozing!</div>
          </div>
        `;
        return;
      }

      let filtered = msgs;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = msgs.filter(m => m.text?.toLowerCase().includes(q));
        const countLabel = document.getElementById('in-chat-results-count');
        if (countLabel) countLabel.textContent = `${filtered.length} ta topildi`;
      }

      let html = '';
      let lastDate = '';

      filtered.forEach(msg => {
        const isOut = msg.senderId === Store.currentUser?.uid;
        const msgDate = new Date(msg.timestamp || Date.now()).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' });

        if (msgDate !== lastDate) {
          html += `<div class="date-separator">${msgDate}</div>`;
          lastDate = msgDate;
        }

        const isSelected = this.selectedMessageIds.has(msg.id);

        // Content generation
        let contentHtml = '';
        if (msg.type === 'image') {
          contentHtml = `<img class="msg-media-img" src="${msg.mediaUrl}" alt="Rasm" onclick="window.TelePulceApp.openLightbox('${msg.mediaUrl}')">`;
          if (msg.text) contentHtml += `<div class="msg-text">${this.escapeHTML(msg.text)}</div>`;
        } else if (msg.type === 'video') {
          contentHtml = `<video class="msg-media-video" src="${msg.mediaUrl}" controls></video>`;
          if (msg.text) contentHtml += `<div class="msg-text">${this.escapeHTML(msg.text)}</div>`;
        } else if (msg.type === 'round_video') {
          contentHtml = `
            <div class="msg-round-video-wrapper">
              <video src="${msg.mediaUrl}" autoplay loop muted playsinline></video>
            </div>
          `;
        } else if (msg.type === 'file') {
          contentHtml = `
            <div class="msg-doc-box">
              <div class="doc-icon-circle"><i class="fa-solid fa-file"></i></div>
              <div class="doc-info">
                <div class="doc-name">${this.escapeHTML(msg.fileName || 'Hujjat')}</div>
                <div class="doc-size">${msg.fileSize || '1.2 MB'}</div>
              </div>
              <a href="${msg.mediaUrl}" download="${msg.fileName || 'file'}" class="doc-download-btn"><i class="fa-solid fa-arrow-down"></i></a>
            </div>
          `;
        } else if (msg.type === 'voice') {
          contentHtml = `
            <div class="msg-voice-box">
              <button class="voice-play-btn" onclick="window.TelePulceApp.playVoiceSim(this)"><i class="fa-solid fa-play"></i></button>
              <div class="voice-wave-bar">
                <div class="wave-line" style="height: 10px;"></div>
                <div class="wave-line" style="height: 18px;"></div>
                <div class="wave-line" style="height: 12px;"></div>
                <div class="wave-line" style="height: 22px;"></div>
                <div class="wave-line" style="height: 14px;"></div>
                <div class="wave-line" style="height: 8px;"></div>
              </div>
              <span class="voice-duration">${msg.duration || '0:05'}</span>
            </div>
          `;
        } else {
          contentHtml = `<div class="msg-text">${this.formatMessageText(msg.text)}</div>`;
        }

        // Forward / Reply headers inside bubble
        let forwardHeader = '';
        if (msg.forwardFrom) {
          forwardHeader = `<div class="bubble-forward-header"><i class="fa-solid fa-share" style="font-size:10px;"></i> Yo‘naltirilgan xabar: ${this.escapeHTML(msg.forwardFrom)}</div>`;
        }
        let replyPreview = '';
        if (msg.replyTo) {
          replyPreview = `
            <div class="bubble-reply-preview" onclick="window.TelePulceApp.scrollToMessage('${msg.replyTo.id}')">
              <div class="reply-preview-author">${this.escapeHTML(msg.replyTo.senderName)}</div>
              <div class="reply-preview-msg">${this.escapeHTML(msg.replyTo.text)}</div>
            </div>
          `;
        }

        // Reactions
        let reactionsHtml = '';
        if (msg.reactions && Object.keys(msg.reactions).length > 0) {
          reactionsHtml = '<div class="msg-reactions-row">';
          for (const [emoji, users] of Object.entries(msg.reactions)) {
            const hasReacted = users.includes(Store.currentUser?.uid);
            reactionsHtml += `
              <div class="reaction-pill ${hasReacted ? 'user-reacted' : ''}" onclick="window.TelePulceApp.toggleReaction('${msg.id}', '${emoji}')">
                <span>${emoji}</span>
                <span>${users.length}</span>
              </div>
            `;
          }
          reactionsHtml += '</div>';
        }

        // Group Sender Title
        let senderTitle = '';
        if (currentChat?.type === 'group' && !isOut) {
          senderTitle = `<div class="msg-sender-title">${this.escapeHTML(msg.senderName || 'A‘zo')}</div>`;
        }

        html += `
          <div class="message-row ${isOut ? 'outgoing' : 'incoming'} ${isSelected ? 'selected' : ''}" id="msg-${msg.id}" data-msg-id="${msg.id}">
            <div class="select-checkbox ${isSelected ? 'checked' : ''}" style="${this.isMultiSelectMode ? 'display:flex;' : 'display:none;'}"></div>
            
            ${!isOut && currentChat?.type === 'group' ? `<img class="msg-avatar" src="${msg.senderAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + msg.senderId}" alt="">` : ''}

            <div class="message-bubble" data-msg-id="${msg.id}">
              ${senderTitle}
              ${forwardHeader}
              ${replyPreview}
              ${contentHtml}

              <div class="msg-meta">
                ${msg.isEdited ? '<span class="msg-edited-tag">tahrirlandi</span>' : ''}
                <span class="msg-time-label">${msg.time}</span>
                ${isOut ? '<i class="fa-solid fa-check-double msg-status-check"></i>' : ''}
              </div>

              ${reactionsHtml}
            </div>
          </div>
        `;
      });

      container.innerHTML = html;

      // Attach context menu & multi-select click events
      container.querySelectorAll('.message-bubble').forEach(bubble => {
        bubble.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          const msgId = bubble.getAttribute('data-msg-id');
          this.openContextMenu(e, msgId);
        });

        // Click when in multi-select mode
        bubble.addEventListener('click', (e) => {
          if (this.isMultiSelectMode) {
            const msgId = bubble.getAttribute('data-msg-id');
            this.toggleSelectMessage(msgId);
          }
        });
      });
    },

    /* ─── SCROLL TO BOTTOM ─────────────────────────────────────────────── */
    scrollToBottom() {
      const container = document.getElementById('messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    scrollToMessage(msgId) {
      const el = document.getElementById(`msg-${msgId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.backgroundColor = 'var(--primary-light)';
        setTimeout(() => el.style.backgroundColor = '', 1200);
      }
    },

    /* ─── SEND MESSAGE ─────────────────────────────────────────────────── */
    handleSendAction() {
      const input = document.getElementById('message-input');
      if (!input) return;
      const text = input.value.trim();

      if (!text) {
        // If empty, trigger Voice Recording simulation
        this.startVoiceRecording();
        return;
      }

      if (this.editingMessage) {
        this.submitEditMessage(text);
        input.value = '';
        input.style.height = 'auto';
        this.clearInputAction();
        return;
      }

      const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: Store.currentUser?.uid,
        senderName: Store.currentUser?.displayName,
        senderAvatar: Store.currentUser?.avatar,
        text: text,
        type: 'text',
        time: this.getCurrentTime(),
        timestamp: Date.now(),
        reactions: {},
        status: 'read'
      };

      if (this.replyingMessage) {
        newMsg.replyTo = {
          id: this.replyingMessage.id,
          senderName: this.replyingMessage.senderName,
          text: this.replyingMessage.text
        };
        this.clearInputAction();
      }

      this.pushMessage(newMsg);
      input.value = '';
      input.style.height = 'auto';

      // Reset Send/Mic icon
      const icon = document.getElementById('icon-send-or-mic');
      if (icon) icon.className = 'fa-solid fa-microphone';
    },

    pushMessage(newMsg) {
      if (!this.activeChatId) return;

      if (!Store.messages[this.activeChatId]) {
        Store.messages[this.activeChatId] = [];
      }
      Store.messages[this.activeChatId].push(newMsg);
      Store.saveMessages();

      // Update Chat lastMessage
      const chat = Store.chats.find(c => c.id === this.activeChatId);
      if (chat) {
        chat.updatedAt = Date.now();
        chat.lastMessage = {
          text: newMsg.text || (newMsg.type === 'image' ? '📷 Rasm' : '📎 Fayl'),
          senderId: newMsg.senderId,
          senderName: newMsg.senderName,
          time: newMsg.time
        };
        Store.saveChats();
      }

      this.renderMessages();
      this.scrollToBottom();
      this.renderSidebarChats();
      SoundEffects.playPop();

      // Broadcast to other tabs
      Store.broadcast('new_message', { chatId: this.activeChatId, message: newMsg });
    },

    /* ─── FILE UPLOAD & MEDIA HANDLING ─────────────────────────────────── */
    handleFileUpload(file, type) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const newMsg = {
          id: 'msg_' + Date.now(),
          senderId: Store.currentUser?.uid,
          senderName: Store.currentUser?.displayName,
          senderAvatar: Store.currentUser?.avatar,
          type: type,
          mediaUrl: dataUrl,
          fileName: file.name,
          fileSize: (file.size / 1024 > 1024 ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB'),
          text: '',
          time: this.getCurrentTime(),
          timestamp: Date.now(),
          reactions: {},
          status: 'read'
        };
        this.pushMessage(newMsg);
        this.showToast('Media xabar yuborildi');
      };
      reader.readAsDataURL(file);
    },

    sendRoundVideoMessage() {
      // Demo circular video simulation
      const sampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: Store.currentUser?.uid,
        senderName: Store.currentUser?.displayName,
        senderAvatar: Store.currentUser?.avatar,
        type: 'round_video',
        mediaUrl: sampleVideo,
        time: this.getCurrentTime(),
        timestamp: Date.now(),
        reactions: {},
        status: 'read'
      };
      this.pushMessage(newMsg);
      this.showToast('Dumaloq video xabari yuborildi 📹');
    },

    /* ─── VOICE MESSAGE SIMULATION ─────────────────────────────────────── */
    startVoiceRecording() {
      const bar = document.getElementById('recording-bar');
      const timer = document.getElementById('recording-timer');
      if (bar) bar.style.display = 'flex';

      this.voiceRecordingSeconds = 0;
      if (timer) timer.textContent = '00:00';

      clearInterval(this.voiceRecordingTimer);
      this.voiceRecordingTimer = setInterval(() => {
        this.voiceRecordingSeconds++;
        const mins = String(Math.floor(this.voiceRecordingSeconds / 60)).padStart(2, '0');
        const secs = String(this.voiceRecordingSeconds % 60).padStart(2, '0');
        if (timer) timer.textContent = `${mins}:${secs}`;
      }, 1000);
    },

    cancelVoiceRecording() {
      clearInterval(this.voiceRecordingTimer);
      const bar = document.getElementById('recording-bar');
      if (bar) bar.style.display = 'none';
      this.showToast('Ovoz yozish bekor qilindi');
    },

    submitVoiceRecording() {
      clearInterval(this.voiceRecordingTimer);
      const bar = document.getElementById('recording-bar');
      if (bar) bar.style.display = 'none';

      const mins = String(Math.floor(this.voiceRecordingSeconds / 60)).padStart(2, '0');
      const secs = String(this.voiceRecordingSeconds % 60).padStart(2, '0');
      const durationStr = `${mins}:${secs}`;

      const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: Store.currentUser?.uid,
        senderName: Store.currentUser?.displayName,
        senderAvatar: Store.currentUser?.avatar,
        type: 'voice',
        duration: durationStr === '00:00' ? '0:04' : durationStr,
        text: '🎤 Ovozli xabar',
        time: this.getCurrentTime(),
        timestamp: Date.now(),
        reactions: {},
        status: 'read'
      };
      this.pushMessage(newMsg);
      this.showToast('Ovozli xabar yuborildi');
    },

    playVoiceSim(btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'fa-solid fa-pause';
        setTimeout(() => {
          icon.className = 'fa-solid fa-play';
        }, 3000);
      }
    },

    /* ─── EDIT & REPLY ACTIONS ─────────────────────────────────────────── */
    startReply(msg) {
      this.replyingMessage = msg;
      this.editingMessage = null;

      const bar = document.getElementById('input-action-bar');
      const title = document.getElementById('input-action-title');
      const snippet = document.getElementById('input-action-snippet');

      if (bar && title && snippet) {
        title.innerHTML = `<i class="fa-solid fa-reply"></i> Javob berilmoqda: ${this.escapeHTML(msg.senderName)}`;
        snippet.textContent = msg.text || 'Media xabar';
        bar.style.display = 'flex';
      }
      document.getElementById('message-input')?.focus();
    },

    startEdit(msg) {
      this.editingMessage = msg;
      this.replyingMessage = null;

      const bar = document.getElementById('input-action-bar');
      const title = document.getElementById('input-action-title');
      const snippet = document.getElementById('input-action-snippet');
      const input = document.getElementById('message-input');

      if (bar && title && snippet && input) {
        title.innerHTML = `<i class="fa-solid fa-pen"></i> Xabarni tahrirlash`;
        snippet.textContent = msg.text;
        bar.style.display = 'flex';
        input.value = msg.text;
        input.focus();
      }
    },

    submitEditMessage(newText) {
      if (!this.editingMessage || !this.activeChatId) return;

      const msgs = Store.messages[this.activeChatId] || [];
      const msg = msgs.find(m => m.id === this.editingMessage.id);
      if (msg) {
        msg.text = newText;
        msg.isEdited = true;
        Store.saveMessages();
        this.renderMessages();
        Store.broadcast('edit_message', { chatId: this.activeChatId, messageId: msg.id, newText });
        this.showToast('Xabar tahrirlandi');
      }
    },

    clearInputAction() {
      this.replyingMessage = null;
      this.editingMessage = null;
      const bar = document.getElementById('input-action-bar');
      if (bar) bar.style.display = 'none';
      const input = document.getElementById('message-input');
      if (input) input.value = '';
    },

    /* ─── CONTEXT MENU ACTIONS ─────────────────────────────────────────── */
    bindContextMenu() {
      const menu = document.getElementById('message-context-menu');

      // Reactions click
      menu?.querySelectorAll('.ctx-react-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const emoji = btn.getAttribute('data-reaction');
          if (this.contextTargetMessage) {
            this.toggleReaction(this.contextTargetMessage.id, emoji);
          }
          if (menu) menu.style.display = 'none';
        });
      });

      // Reply
      document.getElementById('ctx-action-reply')?.addEventListener('click', () => {
        if (this.contextTargetMessage) this.startReply(this.contextTargetMessage);
        if (menu) menu.style.display = 'none';
      });

      // Copy
      document.getElementById('ctx-action-copy')?.addEventListener('click', () => {
        if (this.contextTargetMessage?.text) {
          navigator.clipboard.writeText(this.contextTargetMessage.text);
          this.showToast('Matn nusxalandi');
        }
        if (menu) menu.style.display = 'none';
      });

      // Pin
      document.getElementById('ctx-action-pin')?.addEventListener('click', () => {
        if (this.contextTargetMessage && this.activeChatId) {
          const chat = Store.chats.find(c => c.id === this.activeChatId);
          if (chat) {
            chat.pinnedMessageId = this.contextTargetMessage.id;
            Store.saveChats();
            this.updatePinnedBanner(chat);
            this.showToast('Xabar yuqoriga pin qilindi 📌');
          }
        }
        if (menu) menu.style.display = 'none';
      });

      // Forward
      document.getElementById('ctx-action-forward')?.addEventListener('click', () => {
        if (this.contextTargetMessage) {
          this.openForwardModal(this.contextTargetMessage);
        }
        if (menu) menu.style.display = 'none';
      });

      // Save to Saved Messages
      document.getElementById('ctx-action-save')?.addEventListener('click', () => {
        if (this.contextTargetMessage) {
          this.forwardToChat(this.contextTargetMessage, 'chat_saved_messages');
          this.showToast('Saqlangan xabarlarga yuborildi 🔖');
        }
        if (menu) menu.style.display = 'none';
      });

      // Edit (only for author)
      document.getElementById('ctx-action-edit')?.addEventListener('click', () => {
        if (this.contextTargetMessage) this.startEdit(this.contextTargetMessage);
        if (menu) menu.style.display = 'none';
      });

      // Select
      document.getElementById('ctx-action-select')?.addEventListener('click', () => {
        if (this.contextTargetMessage) {
          this.enterMultiSelect(this.contextTargetMessage.id);
        }
        if (menu) menu.style.display = 'none';
      });

      // Delete for Me
      document.getElementById('ctx-action-delete-me')?.addEventListener('click', () => {
        if (this.contextTargetMessage) {
          this.deleteMessage(this.contextTargetMessage.id, false);
        }
        if (menu) menu.style.display = 'none';
      });

      // Delete for Everyone
      document.getElementById('ctx-action-delete-all')?.addEventListener('click', () => {
        if (this.contextTargetMessage) {
          this.deleteMessage(this.contextTargetMessage.id, true);
        }
        if (menu) menu.style.display = 'none';
      });
    },

    openContextMenu(e, msgId) {
      const msgs = Store.messages[this.activeChatId] || [];
      const msg = msgs.find(m => m.id === msgId);
      if (!msg) return;

      this.contextTargetMessage = msg;
      const menu = document.getElementById('message-context-menu');
      if (!menu) return;

      const isOwner = msg.senderId === Store.currentUser?.uid;
      const editBtn = document.getElementById('ctx-action-edit');
      const delAllBtn = document.getElementById('ctx-action-delete-all');

      if (editBtn) editBtn.style.display = isOwner && msg.type === 'text' ? 'flex' : 'none';
      if (delAllBtn) delAllBtn.style.display = isOwner ? 'flex' : 'none';

      menu.style.display = 'flex';
      const menuW = 210;
      const menuH = 340;
      let x = e.clientX;
      let y = e.clientY;

      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 10;
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 10;

      menu.style.left = `${Math.max(10, x)}px`;
      menu.style.top = `${Math.max(10, y)}px`;
    },

    /* ─── REACTIONS ────────────────────────────────────────────────────── */
    toggleReaction(msgId, emoji) {
      if (!this.activeChatId) return;
      const msgs = Store.messages[this.activeChatId] || [];
      const msg = msgs.find(m => m.id === msgId);
      if (!msg) return;

      if (!msg.reactions) msg.reactions = {};
      const uid = Store.currentUser?.uid;

      if (!msg.reactions[emoji]) {
        msg.reactions[emoji] = [];
      }

      const index = msg.reactions[emoji].indexOf(uid);
      if (index > -1) {
        msg.reactions[emoji].splice(index, 1);
        if (msg.reactions[emoji].length === 0) {
          delete msg.reactions[emoji];
        }
      } else {
        msg.reactions[emoji].push(uid);
      }

      Store.saveMessages();
      this.renderMessages();
      Store.broadcast('reaction', { chatId: this.activeChatId, msgId, emoji });
    },

    /* ─── DELETE MESSAGE ───────────────────────────────────────────────── */
    deleteMessage(msgId, forEveryone) {
      if (!this.activeChatId) return;
      const msgs = Store.messages[this.activeChatId] || [];
      const idx = msgs.findIndex(m => m.id === msgId);
      if (idx > -1) {
        msgs.splice(idx, 1);
        Store.saveMessages();
        this.renderMessages();
        this.renderSidebarChats();
        this.showToast(forEveryone ? 'Xabar hamma uchun o‘chirildi' : 'Xabar o‘chirildi');
        Store.broadcast('delete_message', { chatId: this.activeChatId, msgId });
      }
    },

    /* ─── MULTI-SELECT ─────────────────────────────────────────────────── */
    enterMultiSelect(initialId) {
      this.isMultiSelectMode = true;
      this.selectedMessageIds.clear();
      if (initialId) this.selectedMessageIds.add(initialId);

      const topBar = document.getElementById('selection-action-bar');
      if (topBar) topBar.style.display = 'flex';
      this.updateMultiSelectUI();
      this.renderMessages();
    },

    toggleSelectMessage(msgId) {
      if (this.selectedMessageIds.has(msgId)) {
        this.selectedMessageIds.delete(msgId);
      } else {
        this.selectedMessageIds.add(msgId);
      }
      if (this.selectedMessageIds.size === 0) {
        this.exitMultiSelect();
      } else {
        this.updateMultiSelectUI();
        this.renderMessages();
      }
    },

    updateMultiSelectUI() {
      const countEl = document.getElementById('selection-count-text');
      if (countEl) countEl.textContent = `${this.selectedMessageIds.size} ta xabar tanlandi`;
    },

    exitMultiSelect() {
      this.isMultiSelectMode = false;
      this.selectedMessageIds.clear();
      const topBar = document.getElementById('selection-action-bar');
      if (topBar) topBar.style.display = 'none';
      this.renderMessages();
    },

    deleteSelectedMessages() {
      if (this.selectedMessageIds.size === 0 || !this.activeChatId) return;
      if (!confirm(`${this.selectedMessageIds.size} ta tanlangan xabarni o‘chirishni xohlaysizmi?`)) return;

      const msgs = Store.messages[this.activeChatId] || [];
      Store.messages[this.activeChatId] = msgs.filter(m => !this.selectedMessageIds.has(m.id));
      Store.saveMessages();

      this.exitMultiSelect();
      this.renderMessages();
      this.renderSidebarChats();
      this.showToast('Tanlangan xabarlar o‘chirildi');
    },

    openForwardModalForSelected() {
      if (this.selectedMessageIds.size === 0) return;
      const msgs = Store.messages[this.activeChatId] || [];
      const firstMsg = msgs.find(m => this.selectedMessageIds.has(m.id));
      if (firstMsg) this.openForwardModal(firstMsg);
    },

    /* ─── FORWARD MODAL ────────────────────────────────────────────────── */
    openForwardModal(msg) {
      const modal = document.getElementById('modal-forward');
      const listEl = document.getElementById('forward-chat-target-list');
      if (!modal || !listEl) return;

      listEl.innerHTML = Store.chats.map(c => `
        <div class="user-select-row" onclick="window.TelePulceApp.forwardToChatFromModal('${msg.id}', '${c.id}')">
          <img class="user-avatar-img" style="width:40px;height:40px;" src="${c.avatar}" alt="">
          <div style="font-weight:600; font-size:14px;">${this.escapeHTML(c.title)}</div>
        </div>
      `).join('');

      modal.classList.add('active');
    },

    forwardToChatFromModal(msgId, targetChatId) {
      const msgs = Store.messages[this.activeChatId] || [];
      const msg = msgs.find(m => m.id === msgId);
      if (msg) {
        this.forwardToChat(msg, targetChatId);
        document.getElementById('modal-forward')?.classList.remove('active');
        this.showToast('Xabar yo‘naltirildi');
        this.exitMultiSelect();
      }
    },

    forwardToChat(msg, targetChatId) {
      const forwardedMsg = {
        id: 'msg_' + Date.now(),
        senderId: Store.currentUser?.uid,
        senderName: Store.currentUser?.displayName,
        senderAvatar: Store.currentUser?.avatar,
        text: msg.text || '',
        type: msg.type || 'text',
        mediaUrl: msg.mediaUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        forwardFrom: msg.senderName,
        time: this.getCurrentTime(),
        timestamp: Date.now(),
        reactions: {},
        status: 'read'
      };

      if (!Store.messages[targetChatId]) {
        Store.messages[targetChatId] = [];
      }
      Store.messages[targetChatId].push(forwardedMsg);
      Store.saveMessages();

      const chat = Store.chats.find(c => c.id === targetChatId);
      if (chat) {
        chat.updatedAt = Date.now();
        chat.lastMessage = {
          text: forwardedMsg.text || 'Forwarded message',
          senderId: forwardedMsg.senderId,
          senderName: forwardedMsg.senderName,
          time: forwardedMsg.time
        };
        Store.saveChats();
      }
      this.renderSidebarChats();
      Store.broadcast('new_message', { chatId: targetChatId, message: forwardedMsg });
    },

    /* ─── EMOJI & STICKER PICKER ───────────────────────────────────────── */
    renderEmojiPicker(type) {
      const container = document.getElementById('picker-content');
      if (!container) return;

      if (type === 'stickers') {
        container.innerHTML = `
          <div class="sticker-grid">
            ${STICKER_PACK.map(stk => `
              <div class="sticker-item" onclick="window.TelePulceApp.sendSticker('${stk}')">
                <span style="font-size: 48px;">${stk}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="emoji-grid">
            ${EMOJI_LIST.map(em => `
              <button class="emoji-btn" onclick="window.TelePulceApp.insertEmoji('${em}')">${em}</button>
            `).join('')}
          </div>
        `;
      }
    },

    insertEmoji(emoji) {
      const input = document.getElementById('message-input');
      if (input) {
        input.value += emoji;
        input.focus();
        input.dispatchEvent(new Event('input'));
      }
    },

    sendSticker(stickerEmoji) {
      const newMsg = {
        id: 'msg_' + Date.now(),
        senderId: Store.currentUser?.uid,
        senderName: Store.currentUser?.displayName,
        senderAvatar: Store.currentUser?.avatar,
        text: stickerEmoji,
        type: 'text',
        time: this.getCurrentTime(),
        timestamp: Date.now(),
        reactions: {},
        status: 'read'
      };
      this.pushMessage(newMsg);
      const popover = document.getElementById('emoji-picker-popover');
      if (popover) popover.style.display = 'none';
    },

    /* ─── LIGHTBOX MODAL ───────────────────────────────────────────────── */
    openLightbox(imgUrl) {
      const modal = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-img');
      const dl = document.getElementById('lightbox-download-link');
      if (modal && img) {
        img.src = imgUrl;
        if (dl) dl.href = imgUrl;
        modal.classList.add('active');
      }
      document.getElementById('lightbox-close-btn')?.addEventListener('click', () => {
        modal?.classList.remove('active');
      });
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    },

    /* ─── RIGHT INFO DRAWER ────────────────────────────────────────────── */
    renderInfoDrawer() {
      const content = document.getElementById('drawer-body-content');
      const titleEl = document.getElementById('drawer-main-title');
      const chat = Store.chats.find(c => c.id === this.activeChatId);
      if (!content || !chat) return;

      if (titleEl) titleEl.textContent = chat.type === 'group' ? 'Guruh ma‘lumotlari' : (chat.type === 'channel' ? 'Kanal ma‘lumotlari' : 'Foydalanuvchi ma‘lumotlari');

      let membersListHtml = '';
      if (chat.type === 'group' && chat.members) {
        membersListHtml = `
          <div class="drawer-section" style="margin-top: 14px;">
            <div class="drawer-sec-title">A‘zolar (${chat.members.length})</div>
            <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
              ${chat.members.map(uid => {
                const u = this.getUserById(uid);
                const isAdmin = (chat.admins || []).includes(uid);
                const isOwner = chat.ownerId === uid;
                const canRemove = (chat.admins || []).includes(Store.currentUser?.uid) && uid !== Store.currentUser?.uid && !isOwner;

                return `
                  <div class="drawer-info-row" style="justify-content: space-between;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <img src="${u?.avatar || ''}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" alt="">
                      <div>
                        <div style="font-weight:600; font-size:13.5px;">${this.escapeHTML(u?.displayName || uid)}</div>
                        <div style="font-size:11.5px; color:var(--text-muted);">${isAdmin ? '<span style="color:var(--primary); font-weight:600;">admin</span>' : 'a‘zo'}</div>
                      </div>
                    </div>
                    ${canRemove ? `<button class="header-action-btn" style="color:var(--danger); width:28px; height:28px;" onclick="window.TelePulceApp.removeGroupMember('${chat.id}', '${uid}')" title="Guruhdan chiqarish"><i class="fa-solid fa-user-minus"></i></button>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
            ${(chat.admins || []).includes(Store.currentUser?.uid) ? `
              <button class="btn-secondary" style="margin-top:8px; font-size:12.5px; padding:6px 12px;" onclick="window.TelePulceApp.openAddMemberModal('${chat.id}')">
                <i class="fa-solid fa-user-plus"></i> Yangi a‘zo qo‘shish
              </button>
            ` : ''}
          </div>
        `;
      }

      content.innerHTML = `
        <div class="drawer-profile-card">
          <img class="drawer-avatar" src="${chat.avatar}" alt="">
          <div class="drawer-name">${this.escapeHTML(chat.title)}</div>
          <div class="drawer-status">${chat.type.toUpperCase()}</div>
        </div>

        <div class="drawer-section">
          <div class="drawer-sec-title">Tavsif</div>
          <div style="font-size:13.5px; line-height:1.4;">${this.escapeHTML(chat.description || 'Tavsif mavjud emas')}</div>
        </div>

        ${membersListHtml}

        <div class="drawer-section" style="margin-top:14px;">
          <div class="drawer-sec-title">Sozlamalar</div>
          <div class="drawer-info-row" style="cursor:pointer;" onclick="window.TelePulceApp.showToast('Bildirishnoma holati yangilandi')">
            <i class="fa-solid fa-bell"></i>
            <span>Bildirishnomalar</span>
            <span style="margin-left:auto; color:var(--primary); font-size:12px;">Yoqilgan</span>
          </div>
          <div class="drawer-info-row" style="cursor:pointer; color:var(--danger);" onclick="window.TelePulceApp.deleteChat('${chat.id}')">
            <i class="fa-solid fa-trash" style="color:var(--danger);"></i>
            <span>Suhbatni o‘chirish</span>
          </div>
        </div>
      `;
    },

    removeGroupMember(chatId, memberUid) {
      const chat = Store.chats.find(c => c.id === chatId);
      if (!chat) return;
      chat.members = chat.members.filter(id => id !== memberUid);
      Store.saveChats();
      this.renderInfoDrawer();
      this.showToast('A‘zo guruhdan chiqarildi');
    },

    openAddMemberModal(chatId) {
      const chat = Store.chats.find(c => c.id === chatId);
      if (!chat) return;
      const nonMembers = Store.users.filter(u => !(chat.members || []).includes(u.uid));

      if (nonMembers.length === 0) {
        this.showToast('Barcha foydalanuvchilar allaqachon guruh a‘zosi');
        return;
      }

      const modal = document.getElementById('modal-new-chat');
      const list = document.getElementById('new-chat-users-list');
      if (modal && list) {
        list.innerHTML = nonMembers.map(u => `
          <div class="user-select-row" onclick="window.TelePulceApp.addGroupMember('${chat.id}', '${u.uid}')">
            <img class="user-avatar-img" style="width:38px;height:38px;" src="${u.avatar}" alt="">
            <div>
              <div style="font-weight:600; font-size:14px;">${this.escapeHTML(u.displayName)}</div>
              <div style="font-size:12px; color:var(--text-muted);">@${u.username}</div>
            </div>
            <i class="fa-solid fa-plus" style="margin-left:auto; color:var(--primary);"></i>
          </div>
        `).join('');
        modal.classList.add('active');
      }
    },

    addGroupMember(chatId, newUid) {
      const chat = Store.chats.find(c => c.id === chatId);
      if (!chat) return;
      if (!chat.members.includes(newUid)) {
        chat.members.push(newUid);
        Store.saveChats();
        this.renderInfoDrawer();
        document.getElementById('modal-new-chat')?.classList.remove('active');
        this.showToast('Yangi a‘zo qo‘shildi');
      }
    },

    deleteChat(chatId) {
      if (!confirm('Haqiqatan ham bu suhbatni butunlay o‘chirmoqchimisiz?')) return;
      Store.chats = Store.chats.filter(c => c.id !== chatId);
      delete Store.messages[chatId];
      Store.saveChats();
      Store.saveMessages();

      document.getElementById('info-drawer').style.display = 'none';
      this.activeChatId = null;
      document.getElementById('active-chat-container').style.display = 'none';
      document.getElementById('no-chat-view').style.display = 'flex';
      this.renderSidebarChats();
      this.showToast('Suhbat o‘chirildi');
    },

    /* ─── MODAL SUBMISSIONS & CREATIONS ────────────────────────────────── */
    bindModalSubmissions() {
      // 1. New Group Creation
      document.getElementById('btn-submit-create-group')?.addEventListener('click', () => {
        const nameInput = document.getElementById('input-group-name');
        const descInput = document.getElementById('input-group-desc');
        const title = nameInput?.value.trim();
        if (!title) {
          alert('Iltimos, guruh nomini kiriting');
          return;
        }

        // Selected members
        const checkboxes = document.querySelectorAll('.group-member-cb:checked');
        const memberIds = [Store.currentUser?.uid];
        checkboxes.forEach(cb => memberIds.push(cb.value));

        const newGroup = {
          id: 'group_' + Date.now(),
          type: 'group',
          title: title,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
          description: descInput?.value.trim() || 'Guruh suhbati',
          ownerId: Store.currentUser?.uid,
          admins: [Store.currentUser?.uid],
          members: Array.from(new Set(memberIds)),
          pinnedMessageId: null,
          unreadCount: 0,
          updatedAt: Date.now(),
          lastMessage: {
            text: 'Guruh yaratildi 🎉',
            senderId: Store.currentUser?.uid,
            senderName: Store.currentUser?.displayName,
            time: this.getCurrentTime()
          }
        };

        Store.chats.unshift(newGroup);
        Store.saveChats();
        document.getElementById('modal-new-group')?.classList.remove('active');
        nameInput.value = '';
        if (descInput) descInput.value = '';

        this.renderSidebarChats();
        this.openChat(newGroup.id);
        this.showToast('Yangi guruh muvaffaqiyatli yaratildi!');
        Store.broadcast('new_chat', { chat: newGroup });
      });

      // 2. New Channel Creation
      document.getElementById('btn-submit-create-channel')?.addEventListener('click', () => {
        const nameInput = document.getElementById('input-channel-name');
        const descInput = document.getElementById('input-channel-desc');
        const title = nameInput?.value.trim();
        if (!title) {
          alert('Iltimos, kanal nomini kiriting');
          return;
        }

        const newChannel = {
          id: 'channel_' + Date.now(),
          type: 'channel',
          title: title,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`,
          description: descInput?.value.trim() || 'Rasmiy kanal',
          ownerId: Store.currentUser?.uid,
          admins: [Store.currentUser?.uid],
          subscribers: [Store.currentUser?.uid],
          pinnedMessageId: null,
          unreadCount: 0,
          updatedAt: Date.now(),
          lastMessage: {
            text: 'Kanal ochildi 📢',
            senderId: Store.currentUser?.uid,
            senderName: Store.currentUser?.displayName,
            time: this.getCurrentTime()
          }
        };

        Store.chats.unshift(newChannel);
        Store.saveChats();
        document.getElementById('modal-new-channel')?.classList.remove('active');
        nameInput.value = '';
        if (descInput) descInput.value = '';

        this.renderSidebarChats();
        this.openChat(newChannel.id);
        this.showToast('Yangi kanal yaratildi!');
        Store.broadcast('new_chat', { chat: newChannel });
      });

      // 3. Edit Profile
      document.getElementById('btn-save-profile')?.addEventListener('click', () => {
        const name = document.getElementById('input-profile-name')?.value.trim();
        const username = document.getElementById('input-profile-username')?.value.trim().replace('@', '');
        const bio = document.getElementById('input-profile-bio')?.value.trim();

        if (!name || !username) {
          alert('Ism va username bo‘sh bo‘lishi mumkin emas');
          return;
        }

        Store.currentUser.displayName = name;
        Store.currentUser.username = username;
        Store.currentUser.bio = bio;

        // Update in users array
        const u = Store.users.find(x => x.uid === Store.currentUser.uid);
        if (u) {
          u.displayName = name;
          u.username = username;
          u.bio = bio;
          Store.saveUsers();
        }
        Store.saveCurrentUser();

        this.renderNavUser();
        document.getElementById('modal-edit-profile')?.classList.remove('active');
        this.showToast('Profil ma‘lumotlari saqlandi');
      });

      // 4. Register new user form
      document.getElementById('btn-submit-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('reg-fullname')?.value.trim();
        const username = document.getElementById('reg-username')?.value.trim().replace('@', '');
        const email = document.getElementById('reg-email')?.value.trim();
        const bio = document.getElementById('reg-bio')?.value.trim();

        if (!fullname || !username) {
          alert('Ism va username talab qilinadi');
          return;
        }

        const newUser = {
          uid: 'user_' + Date.now(),
          displayName: fullname,
          username: username,
          email: email || `${username}@telepulse.app`,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
          bio: bio || 'TelePulce foydalanuvchisi',
          online: true,
          lastSeen: 'hozir onlayn'
        };

        Store.users.push(newUser);
        Store.saveUsers();
        Store.currentUser = newUser;
        Store.saveCurrentUser();

        this.renderNavUser();
        document.getElementById('modal-register')?.classList.remove('active');
        document.getElementById('modal-switch-user')?.classList.remove('active');
        this.showToast(`Xush kelibsiz, ${fullname}!`);
        this.renderSidebarChats();
      });

      // 5. Settings navigation tabs
      document.querySelectorAll('.settings-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const sec = btn.getAttribute('data-sec');
          document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
          const target = document.getElementById(`settings-panel-${sec}`);
          if (target) target.classList.add('active');
        });
      });

      // Theme choice inside settings
      document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const choice = card.getAttribute('data-theme-choice');
          Store.settings.theme = choice;
          Store.saveSettings();
          this.applyThemeAndSettings();
        });
      });

      // Accent color inside settings
      document.querySelectorAll('.accent-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
          dot.classList.add('active');
          const color = dot.getAttribute('data-accent-color');
          Store.settings.accent = color;
          Store.saveSettings();
          this.applyThemeAndSettings();
        });
      });

      // Font size select inside settings
      document.getElementById('settings-font-size-select')?.addEventListener('change', (e) => {
        Store.settings.fontSize = e.target.value;
        Store.saveSettings();
        this.applyThemeAndSettings();
      });

      // Sound toggle
      document.getElementById('setting-sound-enabled')?.addEventListener('change', (e) => {
        Store.settings.soundEnabled = e.target.checked;
        Store.saveSettings();
        if (e.target.checked) SoundEffects.playPop();
      });

      document.getElementById('btn-trigger-edit-from-settings')?.addEventListener('click', () => {
        document.getElementById('modal-settings')?.classList.remove('active');
        this.openEditProfileModal();
      });

      document.getElementById('btn-open-register-modal')?.addEventListener('click', () => {
        document.getElementById('modal-switch-user')?.classList.remove('active');
        document.getElementById('modal-register')?.classList.add('active');
      });
    },

    /* ─── MODAL OPENERS ────────────────────────────────────────────────── */
    openNewChatModal() {
      const modal = document.getElementById('modal-new-chat');
      const list = document.getElementById('new-chat-users-list');
      const input = document.getElementById('input-search-user');
      if (!modal || !list) return;

      const renderUsers = (q = '') => {
        let users = Store.users.filter(u => u.uid !== Store.currentUser?.uid);
        if (q) {
          const lq = q.toLowerCase();
          users = users.filter(u => u.displayName.toLowerCase().includes(lq) || u.username.toLowerCase().includes(lq));
        }

        list.innerHTML = users.map(u => `
          <div class="user-select-row" onclick="window.TelePulceApp.startPrivateChat('${u.uid}')">
            <img class="user-avatar-img" style="width:40px;height:40px;" src="${u.avatar}" alt="">
            <div>
              <div style="font-weight:600; font-size:14px;">${this.escapeHTML(u.displayName)}</div>
              <div style="font-size:12px; color:var(--text-muted);">@${u.username} • ${u.online ? 'onlayn' : 'oflayn'}</div>
            </div>
            <i class="fa-solid fa-message" style="margin-left:auto; color:var(--primary);"></i>
          </div>
        `).join('');
      };

      renderUsers();
      if (input) {
        input.value = '';
        input.oninput = (e) => renderUsers(e.target.value.trim());
      }
      modal.classList.add('active');
    },

    startPrivateChat(partnerUid) {
      const partner = this.getUserById(partnerUid);
      if (!partner) return;

      // Check if chat already exists
      let chat = Store.chats.find(c => c.type === 'private' && c.partnerId === partnerUid);
      if (!chat) {
        chat = {
          id: 'chat_private_' + partnerUid + '_' + Date.now(),
          type: 'private',
          title: partner.displayName,
          avatar: partner.avatar,
          description: partner.bio,
          partnerId: partnerUid,
          pinnedMessageId: null,
          unreadCount: 0,
          updatedAt: Date.now(),
          lastMessage: {
            text: 'Yangi suhbat boshlandi',
            senderId: Store.currentUser?.uid,
            senderName: 'Siz',
            time: this.getCurrentTime()
          }
        };
        Store.chats.unshift(chat);
        Store.saveChats();
        this.renderSidebarChats();
      }

      document.getElementById('modal-new-chat')?.classList.remove('active');
      this.openChat(chat.id);
    },

    openNewGroupModal() {
      const modal = document.getElementById('modal-new-group');
      const list = document.getElementById('group-member-checkbox-list');
      if (!modal || !list) return;

      const otherUsers = Store.users.filter(u => u.uid !== Store.currentUser?.uid);
      list.innerHTML = otherUsers.map(u => `
        <label class="user-select-row">
          <img class="user-avatar-img" style="width:36px;height:36px;" src="${u.avatar}" alt="">
          <div style="font-size:13.5px; font-weight:600;">${this.escapeHTML(u.displayName)}</div>
          <input type="checkbox" class="user-select-checkbox group-member-cb" value="${u.uid}">
        </label>
      `).join('');

      modal.classList.add('active');
    },

    openNewChannelModal() {
      document.getElementById('modal-new-channel')?.classList.add('active');
    },

    openEditProfileModal() {
      const modal = document.getElementById('modal-edit-profile');
      const nameInput = document.getElementById('input-profile-name');
      const userInput = document.getElementById('input-profile-username');
      const bioInput = document.getElementById('input-profile-bio');
      const avatarPreview = document.getElementById('edit-profile-avatar-preview');

      if (!modal) return;
      if (nameInput) nameInput.value = Store.currentUser?.displayName || '';
      if (userInput) userInput.value = Store.currentUser?.username || '';
      if (bioInput) bioInput.value = Store.currentUser?.bio || '';
      if (avatarPreview) avatarPreview.src = Store.currentUser?.avatar || '';

      modal.classList.add('active');
    },

    openSettingsModal() {
      const modal = document.getElementById('modal-settings');
      if (!modal) return;

      const nameLabel = document.getElementById('settings-user-name-label');
      const subLabel = document.getElementById('settings-user-sub-label');
      const avatarSmall = document.getElementById('settings-user-avatar-small');

      if (nameLabel) nameLabel.textContent = Store.currentUser?.displayName || 'User';
      if (subLabel) subLabel.textContent = `@${Store.currentUser?.username || 'username'}`;
      if (avatarSmall) avatarSmall.src = Store.currentUser?.avatar || '';

      modal.classList.add('active');
    },

    openSwitchUserModal() {
      const modal = document.getElementById('modal-switch-user');
      const list = document.getElementById('switch-user-accounts-list');
      if (!modal || !list) return;

      list.innerHTML = Store.users.map(u => {
        const isCurrent = u.uid === Store.currentUser?.uid;
        return `
          <div class="user-select-row" style="${isCurrent ? 'background:var(--primary-light); border:1px solid var(--primary);' : ''}" onclick="window.TelePulceApp.switchUserTo('${u.uid}')">
            <img class="user-avatar-img" style="width:44px;height:44px;" src="${u.avatar}" alt="">
            <div style="flex:1;">
              <div style="font-weight:700; font-size:14.5px;">${this.escapeHTML(u.displayName)} ${isCurrent ? '<span style="color:var(--primary); font-size:12px;">(Joriy profil)</span>' : ''}</div>
              <div style="font-size:12.5px; color:var(--text-muted);">@${u.username} • ${u.bio || ''}</div>
            </div>
            ${isCurrent ? '<i class="fa-solid fa-check" style="color:var(--primary); font-size:18px;"></i>' : '<button class="btn-secondary" style="font-size:12px; padding:4px 10px;">O‘tish</button>'}
          </div>
        `;
      }).join('');

      modal.classList.add('active');
    },

    switchUserTo(uid) {
      const targetUser = Store.users.find(u => u.uid === uid);
      if (!targetUser) return;

      Store.currentUser = targetUser;
      Store.saveCurrentUser();
      this.renderNavUser();
      this.renderSidebarChats();
      if (this.activeChatId) this.openChat(this.activeChatId);

      document.getElementById('modal-switch-user')?.classList.remove('active');
      this.showToast(`Profil almashtirildi: ${targetUser.displayName}`);
    },

    renderNavUser() {
      const u = Store.currentUser;
      const avatar = document.getElementById('nav-user-avatar');
      const name = document.getElementById('nav-user-name');
      const sub = document.getElementById('nav-user-sub');

      if (avatar) avatar.src = u?.avatar || '';
      if (name) name.textContent = u?.displayName || 'User';
      if (sub) sub.textContent = `@${u?.username || 'username'}`;
    },

    /* ─── UTILITIES ────────────────────────────────────────────────────── */
    showToast(message) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast-pill';
      toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--primary);"></i> <span>${this.escapeHTML(message)}</span>`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 2600);
    },

    getUserById(uid) {
      return Store.users.find(u => u.uid === uid);
    },

    getCurrentTime() {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },

    formatMessageText(raw) {
      if (!raw) return '';
      // Escape HTML and linkify URLs
      const safe = this.escapeHTML(raw);
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return safe.replace(urlRegex, url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
    },

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  };

  // Expose global controller for HTML inline actions
  window.TelePulceApp = App;

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });

})();
