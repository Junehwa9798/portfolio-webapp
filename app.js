(function () {
  'use strict';

  /* ==========================================================================
     1. API 설정 영역 (추후 AWS Lambda Function URL 연동용)
     ========================================================================== */
  const API_CONFIG = {
    // TODO: AWS Lambda Function URL 배포 후 아래 주소를 실제 엔드포인트로 교체하세요.
    LAMBDA_GUESTBOOK_URL: 'https://<your-lambda-id>.lambda-url.ap-northeast-2.on.aws/guestbook',
    LAMBDA_VISITOR_URL: 'https://<your-lambda-id>.lambda-url.ap-northeast-2.on.aws/visitors',
    // 1주차 정적 버전: true (메모리/브라우저 스토리지 사용) / 서버 연동 시 false로 전환
    USE_STATIC_MODE: true,
  };

  /* ==========================================================================
     2. 프로젝트 상세 데이터 (S03)
     ========================================================================== */
  const PROJECTS = {
    'ckks-ai-core': {
      title: 'CKKS 동형암호 기반 AI 추론 웹 코어',
      category: 'Privacy-Preserving AI',
      overview:
        '클라이언트 데이터를 암호화한 상태로 서버에 전송하고, 복호화 없이 동형암호(CKKS) 연산으로 AI 모델 추론을 수행하는 웹 코어 아키텍처를 설계·구현했습니다.',
      period: '2025.09 ~ 2025.12 (4개월)',
      role: '아키텍처 설계 및 암호화 AI 추론 백엔드 코어 개발',
      stack: ['Python', 'CKKS (TenSEAL)', 'FastAPI', 'PostgreSQL', 'AWS'],
      deliverables: [
        'CKKS 스킴 기반 암호문 직렬화 및 웹 API 추론 파이프라인 구축',
        '평문 추론 대비 정확도 손실을 최소화한 다항식 근사 활성화 레이어 적용',
        '추론 요청/응답 지연 시간 및 메모리 사용량 벤치마크 리포트 도출',
      ],
    },
    'quest3-ar-kiosk': {
      title: 'Meta Quest 3 AR 키오스크 가이드',
      category: 'XR / Spatial Computing',
      overview:
        '복잡한 무인 키오스크 화면 앞에서 어려움을 겪는 사용자를 위해 Meta Quest 3 패스스루 환경에서 실시간 시각적·공간적 안내를 제공하는 AR 가이드 시스템을 개발했습니다.',
      period: '2025.03 ~ 2025.06 (4개월)',
      role: 'C# 인터랙션 로직 구현 및 AR UI/UX 흐름 설계',
      stack: ['C#', 'Unity', 'Meta XR SDK', 'AR Passthrough', 'Spatial UI'],
      deliverables: [
        'Meta Quest 3 컬러 패스스루 기반 단계별 키오스크 조작 가이드 앱 구현',
        '핸드 트래킹 및 시선 포커스 기반 직관적 공간 UI 컴포넌트 제작',
        '시나리오별 사용자 테스트를 통한 주문 완료 시간 단축 및 오류율 개선 검증',
      ],
    },
  };

  /* ==========================================================================
     3. 방명록 데이터 & API 서비스 계층 (S05)
     ========================================================================== */
  const PAGE_SIZE = 10;

  // 1주차 정적 버전용 초기 메모리 데이터 (페이지당 10개 페이징 확인 가능하도록 11개 구성)
  let guestbookEntries = [
    {
      id: 11,
      name: '김민수',
      content: '깔끔한 다크 UI와 논리적인 아키텍처 구성이 인상적입니다. AWS 연동 버전도 기대됩니다!',
      createdAt: '2026-11-24 18:40',
    },
    {
      id: 10,
      name: '이서연',
      content: 'CKKS 동형암호 기반 AI 추론 프로젝트가 정말 흥미롭네요. 좋은 성과 있으시길 응원합니다.',
      createdAt: '2026-11-24 17:15',
    },
    {
      id: 9,
      name: '박지훈',
      content: 'Meta Quest 3 AR 키오스크 가이드 아이디어가 실용적이고 사회적 가치도 큰 것 같습니다.',
      createdAt: '2026-11-24 15:22',
    },
    {
      id: 8,
      name: '최유진',
      content: '포트폴리오 가독성이 좋아서 프로젝트 핵심 역량이 한눈에 들어옵니다!',
      createdAt: '2026-11-23 21:05',
    },
    {
      id: 7,
      name: '정현우',
      content: '한양대 ERICA 컴퓨터학부 동문 응원하고 갑니다. 화이팅입니다!',
      createdAt: '2026-11-23 19:30',
    },
    {
      id: 6,
      name: '한소희',
      content: 'PostgreSQL과 AWS 기반 클라우드 운영 역량이 잘 정리되어 있네요.',
      createdAt: '2026-11-23 14:12',
    },
    {
      id: 5,
      name: '강도윤',
      content: '모달 상세 보기와 반응형 레이아웃이 매끄럽게 동작해서 보기 편합니다.',
      createdAt: '2026-11-22 20:48',
    },
    {
      id: 4,
      name: '윤채원',
      content: '클라우드 데이터베이스 1주차 과제 멋지게 완성하셨네요. 다음 주차도 기대해요!',
      createdAt: '2026-11-22 16:03',
    },
    {
      id: 3,
      name: '임태현',
      content: 'Python부터 C#까지 폭넓은 기술 스택을 실제 프로젝트로 증명한 점이 멋집니다.',
      createdAt: '2026-11-21 13:27',
    },
    {
      id: 2,
      name: '송지아',
      content: '방명록 유효성 검증과 페이징 구조까지 꼼꼼하게 구현되어 있네요.',
      createdAt: '2026-11-21 10:15',
    },
    {
      id: 1,
      name: '홍준화',
      content: '포트폴리오에 방문해 주셔서 감사합니다! 편하게 방명록을 남겨주세요.',
      createdAt: '2026-11-20 09:00',
    },
  ];

  const GuestbookService = {
    /**
     * 방명록 목록 조회 (페이지당 10개)
     * 추후 AWS Lambda Function URL 연동 시 fetch() 로직으로 교체
     */
    async fetchEntries(page, pageSize) {
      if (API_CONFIG.USE_STATIC_MODE) {
        const totalItems = guestbookEntries.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * pageSize;
        const items = guestbookEntries.slice(start, start + pageSize);

        return {
          items,
          page: safePage,
          pageSize,
          totalItems,
          totalPages,
        };
      }

      /* ======================================================================
         [AWS Lambda Function URL 연동 코드 예시 - 방명록 조회]
         ======================================================================
      const url = `${API_CONFIG.LAMBDA_GUESTBOOK_URL}?page=${page}&limit=${pageSize}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('방명록 목록을 불러오지 못했습니다.');
      }
      return await response.json();
      */
    },

    /**
     * 방명록 신규 등록
     * 1주차 정적 버전: 메모리 배열 최상단에 임시 추가
     */
    async createEntry(name, content) {
      if (API_CONFIG.USE_STATIC_MODE) {
        const newEntry = {
          id: Date.now(),
          name,
          content,
          createdAt: formatTimestamp(new Date()),
          isNew: true,
        };
        guestbookEntries = [newEntry, ...guestbookEntries];
        return newEntry;
      }

      /* ======================================================================
         [AWS Lambda Function URL 연동 코드 예시 - 방명록 등록]
         ======================================================================
      const response = await fetch(API_CONFIG.LAMBDA_GUESTBOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content }),
      });
      if (!response.ok) {
        throw new Error('방명록 등록에 실패했습니다.');
      }
      return await response.json();
      */
    },
  };

  /* ==========================================================================
     4. 방문자 수 서비스 계층 (Footer + sessionStorage 새로고침 중복 방지)
     ========================================================================== */
  const VISITOR_SESSION_KEY = 'portfolio_visitor_counted_date';
  const VISITOR_STORAGE_KEY = 'portfolio_visitor_stats_v1';

  const VisitorService = {
    /**
     * sessionStorage를 사용해 동일 세션 내 새로고침 중복 카운트를 방지합니다.
     * 최초 접속 시 Today: 1명 / Total: 1명으로 표시됩니다.
     */
    async loadAndTrackVisitor() {
      const todayKey = getTodayDateKey();
      const alreadyCountedToday = sessionStorage.getItem(VISITOR_SESSION_KEY) === todayKey;

      if (API_CONFIG.USE_STATIC_MODE) {
        let stats = { date: todayKey, today: 0, total: 0 };

        try {
          const saved = localStorage.getItem(VISITOR_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (typeof parsed.total === 'number' && typeof parsed.today === 'number') {
              stats = parsed;
            }
          }
        } catch (_) {
          // 스토리지 접근 불가 환경에서는 기본값(1/1)으로 동작
        }

        // 날짜가 바뀌면 오늘 방문자 수 초기화
        if (stats.date !== todayKey) {
          stats.date = todayKey;
          stats.today = 0;
        }

        // 같은 세션에서 새로고침한 경우가 아닐 때만 방문자 수 증가
        if (!alreadyCountedToday) {
          stats.today += 1;
          stats.total += 1;
          try {
            sessionStorage.setItem(VISITOR_SESSION_KEY, todayKey);
            localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(stats));
          } catch (_) {
            // 프라이빗 브라우징 등 예외 무시
          }
        } else if (stats.today === 0 || stats.total === 0) {
          stats.today = Math.max(1, stats.today);
          stats.total = Math.max(1, stats.total);
        }

        return { today: stats.today, total: stats.total };
      }

      /* ======================================================================
         [AWS Lambda Function URL 연동 코드 예시 - 방문자 수 집계/조회]
         ======================================================================
      const method = alreadyCountedToday ? 'GET' : 'POST';
      const response = await fetch(API_CONFIG.LAMBDA_VISITOR_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('방문자 수를 불러오지 못했습니다.');
      }
      if (!alreadyCountedToday) {
        sessionStorage.setItem(VISITOR_SESSION_KEY, todayKey);
      }
      return await response.json(); // 기대 응답 형식: { today: number, total: number }
      */
    },
  };

  /* ==========================================================================
     5. 유틸리티 함수
     ========================================================================== */
  function getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  let toastTimer = null;
  function showToast(message) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2600);
  }

  /* ==========================================================================
     6. 네비게이션 컨트롤러 (모바일 메뉴 + 활성 섹션 하이라이트)
     ========================================================================== */
  function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });

      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('is-open');
          navToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const activeId = entry.target.getAttribute('id');
              navLinks.forEach((link) => {
                link.classList.toggle('active', link.dataset.section === activeId);
              });
            }
          });
        },
        {
          rootMargin: '-35% 0px -55% 0px',
          threshold: 0,
        }
      );

      sections.forEach((section) => observer.observe(section));
    }
  }

  /* ==========================================================================
     7. 프로젝트 상세 모달 컨트롤러 (S03)
     ========================================================================== */
  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const detailButtons = document.querySelectorAll('.btn-detail');

    const titleEl = document.getElementById('modal-title');
    const categoryEl = document.getElementById('modal-category');
    const overviewEl = document.getElementById('modal-overview');
    const periodEl = document.getElementById('modal-period');
    const roleEl = document.getElementById('modal-role');
    const stackEl = document.getElementById('modal-stack');
    const deliverablesEl = document.getElementById('modal-deliverables');

    let lastFocusedTrigger = null;

    function openModal(projectId, triggerBtn) {
      const project = PROJECTS[projectId];
      if (!project || !modal) return;

      lastFocusedTrigger = triggerBtn || null;

      categoryEl.textContent = project.category;
      titleEl.textContent = project.title;
      overviewEl.textContent = project.overview;
      periodEl.textContent = project.period;
      roleEl.textContent = project.role;

      stackEl.innerHTML = '';
      project.stack.forEach((tech) => {
        const li = document.createElement('li');
        li.textContent = tech;
        stackEl.appendChild(li);
      });

      deliverablesEl.innerHTML = '';
      project.deliverables.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        deliverablesEl.appendChild(li);
      });

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      closeBtn.focus();
    }

    function closeModal() {
      if (!modal || !modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');

      if (lastFocusedTrigger) {
        lastFocusedTrigger.focus();
      }
    }

    detailButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        openModal(btn.dataset.projectId, btn);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     8. 방명록 컨트롤러 (S05: 검증, 임시 추가, 페이지당 10개 페이징)
     ========================================================================== */
  function initGuestbook() {
    const form = document.getElementById('guestbook-form');
    const nameInput = document.getElementById('guest-name');
    const contentInput = document.getElementById('guest-content');
    const nameCounter = document.getElementById('name-counter');
    const contentCounter = document.getElementById('content-counter');
    const nameError = document.getElementById('name-error');
    const contentError = document.getElementById('content-error');
    const listEl = document.getElementById('guestbook-list');
    const paginationEl = document.getElementById('guestbook-pagination');
    const totalCountEl = document.getElementById('guestbook-total-count');

    let currentPage = 1;

    function updateCounters() {
      nameCounter.textContent = `${nameInput.value.trim().length} / 10자`;
      contentCounter.textContent = `${contentInput.value.trim().length} / 100자`;
    }

    function clearErrors() {
      nameError.textContent = '';
      contentError.textContent = '';
      nameInput.classList.remove('invalid');
      contentInput.classList.remove('invalid');
    }

    function validateForm() {
      clearErrors();
      const trimmedName = nameInput.value.trim();
      const trimmedContent = contentInput.value.trim();
      let isValid = true;

      if (!trimmedName) {
        nameError.textContent = '이름을 입력해 주세요.';
        nameInput.classList.add('invalid');
        isValid = false;
      } else if (trimmedName.length < 2 || trimmedName.length > 10) {
        nameError.textContent = '이름은 2~10자 사이로 입력해 주세요.';
        nameInput.classList.add('invalid');
        isValid = false;
      }

      if (!trimmedContent) {
        contentError.textContent = '방명록 내용을 입력해 주세요.';
        contentInput.classList.add('invalid');
        isValid = false;
      } else if (trimmedContent.length < 5 || trimmedContent.length > 100) {
        contentError.textContent = '내용은 5~100자 사이로 입력해 주세요.';
        contentInput.classList.add('invalid');
        isValid = false;
      }

      return { isValid, trimmedName, trimmedContent };
    }

    async function renderGuestbook(page) {
      const data = await GuestbookService.fetchEntries(page, PAGE_SIZE);
      currentPage = data.page;
      totalCountEl.textContent = String(data.totalItems);

      listEl.innerHTML = '';

      if (data.items.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'guestbook-empty';
        emptyLi.textContent = '아직 등록된 방명록이 없습니다. 첫 번째 메시지를 남겨주세요!';
        listEl.appendChild(emptyLi);
      } else {
        data.items.forEach((entry) => {
          const li = document.createElement('li');
          li.className = entry.isNew ? 'guestbook-item is-new' : 'guestbook-item';

          const headerDiv = document.createElement('div');
          headerDiv.className = 'guestbook-item-header';

          const authorSpan = document.createElement('span');
          authorSpan.className = 'guestbook-author';
          authorSpan.textContent = entry.name;

          const dateSpan = document.createElement('span');
          dateSpan.className = 'guestbook-date';
          dateSpan.textContent = entry.createdAt;

          headerDiv.appendChild(authorSpan);
          headerDiv.appendChild(dateSpan);

          const contentP = document.createElement('p');
          contentP.className = 'guestbook-content';
          contentP.textContent = entry.content;

          li.appendChild(headerDiv);
          li.appendChild(contentP);
          listEl.appendChild(li);
        });
      }

      renderPagination(data.page, data.totalPages);
    }

    function renderPagination(activePage, totalPages) {
      paginationEl.innerHTML = '';

      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'page-btn';
      prevBtn.textContent = '이전';
      prevBtn.disabled = activePage <= 1;
      prevBtn.addEventListener('click', () => renderGuestbook(activePage - 1));
      paginationEl.appendChild(prevBtn);

      for (let i = 1; i <= totalPages; i += 1) {
        const pageBtn = document.createElement('button');
        pageBtn.type = 'button';
        pageBtn.className = i === activePage ? 'page-btn active' : 'page-btn';
        pageBtn.textContent = String(i);
        pageBtn.setAttribute('aria-current', i === activePage ? 'page' : 'false');
        pageBtn.addEventListener('click', () => renderGuestbook(i));
        paginationEl.appendChild(pageBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'page-btn';
      nextBtn.textContent = '다음';
      nextBtn.disabled = activePage >= totalPages;
      nextBtn.addEventListener('click', () => renderGuestbook(activePage + 1));
      paginationEl.appendChild(nextBtn);
    }

    nameInput.addEventListener('input', () => {
      updateCounters();
      if (nameInput.classList.contains('invalid')) {
        nameError.textContent = '';
        nameInput.classList.remove('invalid');
      }
    });

    contentInput.addEventListener('input', () => {
      updateCounters();
      if (contentInput.classList.contains('invalid')) {
        contentError.textContent = '';
        contentInput.classList.remove('invalid');
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const { isValid, trimmedName, trimmedContent } = validateForm();
      if (!isValid) return;

      await GuestbookService.createEntry(trimmedName, trimmedContent);

      // 입력 폼 초기화
      form.reset();
      updateCounters();
      clearErrors();

      // 목록 최상단(1페이지)으로 즉시 갱신 및 '등록 완료' 알림 표시
      await renderGuestbook(1);
      showToast('등록 완료');
    });

    updateCounters();
    renderGuestbook(currentPage);
  }

  /* ==========================================================================
     9. Footer 방문자 수 초기화
     ========================================================================== */
  async function initVisitorCounter() {
    const visitorTextEl = document.getElementById('visitor-text');
    if (!visitorTextEl) return;

    try {
      const stats = await VisitorService.loadAndTrackVisitor();
      visitorTextEl.textContent = `Today: ${stats.today}명 / Total: ${stats.total}명`;
    } catch (_) {
      visitorTextEl.textContent = 'Today: 1명 / Total: 1명';
    }
  }

  /* ==========================================================================
     10. 앱 진입점
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProjectModal();
    initGuestbook();
    initVisitorCounter();
  });
})();
