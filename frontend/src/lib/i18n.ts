export type Lang = 'ru' | 'en' | 'kz'

const dict = {
  // ── Navbar ──────────────────────────────────────────────────────────────
  'nav.feed':          { ru: 'Лента',               en: 'Feed',             kz: 'Арна' },
  'nav.opportunities': { ru: 'Возможности',          en: 'Opportunities',    kz: 'Мүмкіндіктер' },
  'nav.courses':       { ru: 'Курсы',                en: 'Courses',          kz: 'Курстар' },
  'nav.calendar':      { ru: 'Календарь',            en: 'Calendar',         kz: 'Күнтізбе' },
  'nav.roadmap':       { ru: 'Roadmap',              en: 'Roadmap',          kz: 'Roadmap' },
  'nav.mentors':       { ru: 'Менторы',              en: 'Mentors',          kz: 'Тьюторлар' },
  'nav.dashboard':     { ru: 'Кабинет',              en: 'Dashboard',        kz: 'Кабинет' },
  'nav.createPost':    { ru: 'Создать пост',         en: 'Create Post',      kz: 'Жазба жасау' },
  'nav.createCourse':  { ru: 'Создать курс',         en: 'Create Course',    kz: 'Курс жасау' },
  'nav.signOut':       { ru: 'Выйти из аккаунта',   en: 'Sign Out',         kz: 'Шығу' },
  'nav.exit':          { ru: 'Выйти',                en: 'Exit',             kz: 'Шығу' },

  // ── Landing ─────────────────────────────────────────────────────────────
  'landing.badge':       { ru: 'Для учеников 8–11 классов', en: 'For students grades 8–11', kz: '8–11 сынып оқушылары үшін' },
  'landing.hero':        { ru: 'Твои возможности — в одном месте', en: 'Your opportunities — in one place', kz: 'Мүмкіндіктерің — бір жерде' },
  'landing.sub':         { ru: 'Mentoria Hub — платформа для школьников Казахстана и СНГ. Находи олимпиады, стипендии, хакатоны и стажировки. Проходи курсы. Общайся с менторами.', en: 'Mentoria Hub — a platform for students in Kazakhstan and CIS. Find olympiads, scholarships, hackathons and internships. Take courses. Connect with mentors.', kz: 'Mentoria Hub — Қазақстан және ТМД мектеп оқушыларына арналған платформа. Олимпиадалар, стипендиялар, хакатондар мен тәжірибелерді тап. Курстар ал. Тьюторлармен байланыс.' },
  'landing.start':       { ru: 'Начать бесплатно',   en: 'Start for free',   kz: 'Тегін бастау' },
  'landing.signin':      { ru: 'Войти',              en: 'Sign In',          kz: 'Кіру' },
  'landing.welcome':     { ru: 'Добро пожаловать!',  en: 'Welcome!',         kz: 'Қош келдіңіз!' },
  'landing.welcomeSub':  { ru: 'Войди или зарегистрируйся, чтобы начать', en: 'Sign in or register to get started', kz: 'Бастау үшін кіріңіз немесе тіркеліңіз' },
  'landing.register':    { ru: 'Зарегистрироваться', en: 'Register',         kz: 'Тіркелу' },
  'landing.hasAccount':  { ru: 'Уже есть аккаунт',  en: 'Already have an account', kz: 'Аккаунтым бар' },
  'landing.signinTitle': { ru: 'Вход',               en: 'Sign In',          kz: 'Кіру' },
  'landing.password':    { ru: 'Пароль',             en: 'Password',         kz: 'Құпия сөз' },
  'landing.signingIn':   { ru: 'Входим...',          en: 'Signing in...',    kz: 'Кіруде...' },
  'landing.noAccount':   { ru: 'Нет аккаунта? Зарегистрируйся', en: 'No account? Register', kz: 'Аккаунт жоқ? Тіркеліңіз' },
  'landing.signupTitle': { ru: 'Регистрация',        en: 'Registration',     kz: 'Тіркелу' },
  'landing.fullName':    { ru: 'Полное имя',         en: 'Full name',        kz: 'Толық аты-жөні' },
  'landing.passwordMin': { ru: 'Пароль (мин. 6 символов)', en: 'Password (min. 6 chars)', kz: 'Құпия сөз (кем. 6 таңба)' },
  'landing.mentorCode':  { ru: 'Код ментора (если есть)', en: 'Mentor code (if any)', kz: 'Тьютор коды (бар болса)' },
  'landing.creating':    { ru: 'Создаём аккаунт...', en: 'Creating account...', kz: 'Аккаунт жасалуда...' },
  'landing.haveAccount': { ru: 'Уже есть аккаунт? Войти', en: 'Already have an account? Sign In', kz: 'Аккаунтыңыз бар? Кіріңіз' },
  'landing.feat1Title':  { ru: 'Лента возможностей', en: 'Opportunities Feed', kz: 'Мүмкіндіктер арнасы' },
  'landing.feat1Desc':   { ru: 'Олимпиады, хакатоны, стипендии — подобраны под твои интересы и класс', en: 'Olympiads, hackathons, scholarships — matched to your interests and grade', kz: 'Олимпиадалар, хакатондар, стипендиялар — қызығушылықтарыңа сай таңдалған' },
  'landing.feat2Title':  { ru: 'Асинхронные курсы',  en: 'Async Courses',    kz: 'Асинхронды курстар' },
  'landing.feat2Desc':   { ru: 'Учись в своём темпе. Отслеживай прогресс и возвращайся когда удобно', en: 'Learn at your own pace. Track progress and return when convenient', kz: 'Өз қарқыныңда үйрен. Прогрессіңді бақыла, ыңғайлы кезде оралып кет' },
  'landing.feat3Title':  { ru: 'Менторы',             en: 'Mentors',          kz: 'Тьюторлар' },
  'landing.feat3Desc':   { ru: 'Связывайся с менторами из топовых университетов мира', en: 'Connect with mentors from top universities worldwide', kz: 'Дүниежүзінің үздік университеттерінен тьюторлармен байланыс' },

  // ── Feed ────────────────────────────────────────────────────────────────
  'feed.hi':    { ru: 'Привет, {name} 👋', en: 'Hi, {name} 👋',     kz: 'Сәлем, {name} 👋' },
  'feed.empty': { ru: 'Лента пуста',       en: 'Feed is empty',      kz: 'Арна бос' },
  'feed.hint':  { ru: 'Обнови интересы в профиле — мы подберём подходящие возможности', en: 'Update your interests in profile — we\'ll find matching opportunities', kz: 'Профильдегі қызығушылықтарыңды жаңарт — біз сәйкес мүмкіндіктер іздейміз' },

  // ── Opportunities ────────────────────────────────────────────────────────
  'opp.title':       { ru: 'Возможности',     en: 'Opportunities',  kz: 'Мүмкіндіктер' },
  'opp.search':      { ru: 'Поиск по названию, описанию, тегам...', en: 'Search by title, description, tags...', kz: 'Атауы, сипаттамасы, тегтер бойынша...' },
  'opp.all':         { ru: 'Все',             en: 'All',            kz: 'Барлығы' },
  'opp.grade':       { ru: 'Класс:',          en: 'Grade:',         kz: 'Сынып:' },
  'opp.reset':       { ru: 'Сбросить',        en: 'Reset',          kz: 'Тазалау' },
  'opp.found':       { ru: 'Найдено:',        en: 'Found:',         kz: 'Табылды:' },
  'opp.nothing':     { ru: 'Ничего не нашлось', en: 'Nothing found', kz: 'Ештеңе табылмады' },
  'opp.tryFilters':  { ru: 'Попробуй изменить фильтры', en: 'Try changing filters', kz: 'Сүзгілерді өзгертіп көр' },
  'opp.noPublished': { ru: 'Пока нет опубликованных возможностей', en: 'No published opportunities yet', kz: 'Әлі жарияланған мүмкіндіктер жоқ' },
  'opp.resetBtn':    { ru: 'Сбросить фильтры', en: 'Reset filters', kz: 'Сүзгілерді тазалау' },

  // ── Categories ───────────────────────────────────────────────────────────
  'cat.competition':    { ru: 'Конкурсы',         en: 'Competitions',    kz: 'Байқаулар' },
  'cat.scholarship':    { ru: 'Стипендии',         en: 'Scholarships',    kz: 'Стипендиялар' },
  'cat.summer_program': { ru: 'Летние программы',  en: 'Summer Programs', kz: 'Жазғы бағдарламалар' },
  'cat.hackathon':      { ru: 'Хакатоны',          en: 'Hackathons',      kz: 'Хакатондар' },
  'cat.olympiad':       { ru: 'Олимпиады',         en: 'Olympiads',       kz: 'Олимпиадалар' },
  'cat.internship':     { ru: 'Стажировки',        en: 'Internships',     kz: 'Тәжірибелер' },
  'cat.research':       { ru: 'Исследования',      en: 'Research',        kz: 'Зерттеулер' },
  'cat.event':          { ru: 'Мероприятия',       en: 'Events',          kz: 'Іс-шаралар' },

  // ── Courses ──────────────────────────────────────────────────────────────
  'courses.title':         { ru: 'Курсы',                  en: 'Courses',                  kz: 'Курстар' },
  'courses.empty':         { ru: 'Курсы ещё не добавлены', en: 'No courses yet',            kz: 'Курстар әлі қосылмаған' },
  'courses.hint':          { ru: 'Скоро здесь появятся первые курсы', en: 'First courses coming soon', kz: 'Жақында алғашқы курстар қосылады' },
  'courses.lessons':       { ru: 'уроков',                 en: 'lessons',                  kz: 'сабақ' },
  'courses.done':          { ru: 'Завершён',               en: 'Completed',                kz: 'Аяқталды' },
  'courses.cont':          { ru: 'Продолжить',             en: 'Continue',                 kz: 'Жалғастыру' },
  'courses.start':         { ru: 'Начать',                 en: 'Start',                    kz: 'Бастау' },
  'courses.open':          { ru: 'Открыть курс',           en: 'Open Course',              kz: 'Курсты ашу' },
  'courses.beginner':      { ru: 'Начальный',              en: 'Beginner',                 kz: 'Бастауыш' },
  'courses.intermediate':  { ru: 'Средний',                en: 'Intermediate',             kz: 'Орташа' },
  'courses.advanced':      { ru: 'Продвинутый',            en: 'Advanced',                 kz: 'Жоғары' },

  // ── Calendar ─────────────────────────────────────────────────────────────
  'cal.title':       { ru: 'Календарь',   en: 'Calendar',   kz: 'Күнтізбе' },
  'cal.deadline':    { ru: 'Дедлайн',     en: 'Deadline',   kz: 'Мерзім' },
  'cal.event':       { ru: 'Мероприятие', en: 'Event',      kz: 'Іс-шара' },
  'cal.loading':     { ru: 'Загрузка...', en: 'Loading...', kz: 'Жүктелуде...' },
  'cal.noEvents':    { ru: 'Нет сохранённых событий на этот день', en: 'No saved events for this day', kz: 'Бұл күнге сақталған оқиғалар жоқ' },
  'cal.saveHint':    { ru: 'Сохраняй интересные возможности — они появятся здесь', en: 'Save interesting opportunities — they\'ll appear here', kz: 'Қызықты мүмкіндіктерді сақта — олар осында пайда болады' },
  'cal.deadlineLbl': { ru: 'Дедлайн:',   en: 'Deadline:',  kz: 'Мерзім:' },
  'cal.event1':      { ru: 'событие',    en: 'event',      kz: 'оқиға' },
  'cal.eventsN':     { ru: 'событий',    en: 'events',     kz: 'оқиға' },
  'cal.locale':      { ru: 'ru-RU',      en: 'en-US',      kz: 'kk-KZ' },

  // ── Calendar months ──────────────────────────────────────────────────────
  'month.0':  { ru: 'Январь',   en: 'January',   kz: 'Қаңтар' },
  'month.1':  { ru: 'Февраль',  en: 'February',  kz: 'Ақпан' },
  'month.2':  { ru: 'Март',     en: 'March',     kz: 'Наурыз' },
  'month.3':  { ru: 'Апрель',   en: 'April',     kz: 'Сәуір' },
  'month.4':  { ru: 'Май',      en: 'May',       kz: 'Мамыр' },
  'month.5':  { ru: 'Июнь',     en: 'June',      kz: 'Маусым' },
  'month.6':  { ru: 'Июль',     en: 'July',      kz: 'Шілде' },
  'month.7':  { ru: 'Август',   en: 'August',    kz: 'Тамыз' },
  'month.8':  { ru: 'Сентябрь', en: 'September', kz: 'Қыркүйек' },
  'month.9':  { ru: 'Октябрь',  en: 'October',   kz: 'Қазан' },
  'month.10': { ru: 'Ноябрь',   en: 'November',  kz: 'Қараша' },
  'month.11': { ru: 'Декабрь',  en: 'December',  kz: 'Желтоқсан' },

  // ── Calendar days ────────────────────────────────────────────────────────
  'day.0': { ru: 'Пн', en: 'Mo', kz: 'Дс' },
  'day.1': { ru: 'Вт', en: 'Tu', kz: 'Сс' },
  'day.2': { ru: 'Ср', en: 'We', kz: 'Ср' },
  'day.3': { ru: 'Чт', en: 'Th', kz: 'Бс' },
  'day.4': { ru: 'Пт', en: 'Fr', kz: 'Жм' },
  'day.5': { ru: 'Сб', en: 'Sa', kz: 'Сб' },
  'day.6': { ru: 'Вс', en: 'Su', kz: 'Жс' },

  // ── Roadmap ──────────────────────────────────────────────────────────────
  'rm.title':   { ru: 'Roadmap школьника', en: 'Student Roadmap', kz: 'Оқушы Roadmap' },
  'rm.sub':     { ru: 'Ориентир по важным активностям для каждого класса', en: 'Key activities guide for each grade', kz: 'Әр сынып үшін маңызды іс-шаралар жетекшісі' },
  'rm.current': { ru: 'Сейчас',           en: 'Current',         kz: 'Қазір' },
  'rm.grade':   { ru: 'класс',            en: 'Grade',           kz: 'сынып' },

  // ── Dashboard ────────────────────────────────────────────────────────────
  'dash.title':       { ru: 'Личный кабинет',       en: 'My Profile',           kz: 'Жеке кабинет' },
  'dash.name':        { ru: 'Имя',                  en: 'Name',                 kz: 'Аты-жөні' },
  'dash.about':       { ru: 'О себе',               en: 'About me',             kz: 'Өзім туралы' },
  'dash.contacts':    { ru: 'Контакты',             en: 'Contacts',             kz: 'Байланыс' },
  'dash.grade':       { ru: 'Класс',                en: 'Grade',                kz: 'Сынып' },
  'dash.interests':   { ru: 'Интересы',             en: 'Interests',            kz: 'Қызығушылықтар' },
  'dash.goals':       { ru: 'Цели',                 en: 'Goals',                kz: 'Мақсаттар' },
  'dash.saved':       { ru: 'Сохранённые посты',    en: 'Saved Posts',          kz: 'Сақталған жазбалар' },
  'dash.nothingSaved':{ ru: 'Пока ничего не сохранено', en: 'Nothing saved yet', kz: 'Әлі ештеңе сақталмаған' },
  'dash.notSet':      { ru: 'Не указаны',           en: 'Not set',              kz: 'Көрсетілмеген' },
  'dash.notSetSg':    { ru: 'Не указано',           en: 'Not set',              kz: 'Көрсетілмеген' },
  'dash.gradeClass':  { ru: ' класс',               en: 'th grade',             kz: '-сынып' },
  'dash.tellStudents':{ ru: 'Расскажи студентам о своём опыте и чем можешь помочь', en: 'Tell students about your experience and how you can help', kz: 'Тәжірибеңіз бен қалай көмектесе алатыныңыз туралы айтыңыз' },
  'dash.yourName':    { ru: 'Твоё имя',             en: 'Your name',            kz: 'Атыңыз' },
  'dash.phonePh':     { ru: 'Номер телефона',       en: 'Phone number',         kz: 'Телефон нөмірі' },
  'dash.emailPh':     { ru: 'Email для связи',      en: 'Contact email',        kz: 'Байланыс email' },

  // ── Goals ────────────────────────────────────────────────────────────────
  'goal.university_abroad': { ru: 'Поступление за рубеж', en: 'Study Abroad', kz: 'Шетелде оқу' },
  'goal.olympiads':         { ru: 'Олимпиады',            en: 'Olympiads',    kz: 'Олимпиадалар' },
  'goal.startup':           { ru: 'Стартап',              en: 'Startup',      kz: 'Стартап' },
  'goal.research':          { ru: 'Исследования',         en: 'Research',     kz: 'Зерттеулер' },

  // ── Mentors ──────────────────────────────────────────────────────────────
  'mentors.title':   { ru: 'Менторы',               en: 'Mentors',                  kz: 'Тьюторлар' },
  'mentors.sub':     { ru: 'Свяжись с ментором из топовых университетов', en: 'Connect with a mentor from top universities', kz: 'Үздік университеттерден тьютормен байланысыңыз' },
  'mentors.soon':    { ru: 'Менторы скоро появятся', en: 'Mentors coming soon',      kz: 'Тьюторлар жақында қосылады' },
  'mentors.hiring':  { ru: 'Мы активно набираем менторов из ведущих вузов', en: 'We\'re actively recruiting mentors from top universities', kz: 'Біз үздік университеттерден белсенді тьюторлар іздеудеміз' },
  'mentors.contact': { ru: 'Связаться',             en: 'Contact',                  kz: 'Хабарласу' },

  // ── Onboarding ───────────────────────────────────────────────────────────
  'onb.gradeQ':    { ru: 'В каком ты классе?',     en: 'What grade are you in?',     kz: 'Сен қай сыныптасың?' },
  'onb.gradeHint': { ru: 'Мы подберём возможности под твой класс', en: 'We\'ll find opportunities for your grade', kz: 'Сыныбыңа сай мүмкіндіктер таңдаймыз' },
  'onb.intQ':      { ru: 'Что тебя интересует?',   en: 'What are you interested in?', kz: 'Саған не қызық?' },
  'onb.intHint':   { ru: 'Выбери несколько направлений', en: 'Choose several areas', kz: 'Бірнеше бағытты таңда' },
  'onb.goalQ':     { ru: 'Какая у тебя цель?',     en: 'What is your goal?',          kz: 'Сенің мақсатың қандай?' },
  'onb.goalHint':  { ru: 'Можешь выбрать несколько', en: 'You can choose several',   kz: 'Бірнешеуін таңдауыңа болады' },
  'onb.next':      { ru: 'Далее',                  en: 'Next',                        kz: 'Келесі' },
  'onb.back':      { ru: 'Назад',                  en: 'Back',                        kz: 'Артқа' },
  'onb.done':      { ru: 'Готово 🎉',              en: 'Done 🎉',                     kz: 'Дайын 🎉' },
  'onb.saving':    { ru: 'Сохраняем...',           en: 'Saving...',                   kz: 'Сақтауда...' },
  'onb.step':      { ru: 'Шаг {n} из 3',           en: 'Step {n} of 3',               kz: '{n}/3-қадам' },

  // onboarding goal labels
  'onb.goal.university_abroad': { ru: 'Поступление за рубеж', en: 'Study Abroad', kz: 'Шетелде оқу' },
  'onb.goal.olympiads':         { ru: 'Олимпиады',            en: 'Olympiads',    kz: 'Олимпиадалар' },
  'onb.goal.startup':           { ru: 'Стартап',              en: 'Startup',      kz: 'Стартап' },
  'onb.goal.research':          { ru: 'Исследования',         en: 'Research',     kz: 'Зерттеулер' },

  // ── Mentor Onboarding ────────────────────────────────────────────────────
  'mo.title':   { ru: 'Профиль ментора',      en: 'Mentor Profile',   kz: 'Тьютор профилі' },
  'mo.sub':     { ru: 'Расскажи о себе студентам', en: 'Tell students about yourself', kz: 'Студенттерге өзіңіз туралы айтыңыз' },
  'mo.name':    { ru: 'Имя *',               en: 'Name *',           kz: 'Аты-жөні *' },
  'mo.namePh':  { ru: 'Твоё полное имя',     en: 'Your full name',   kz: 'Толық атыңыз' },
  'mo.uni':     { ru: 'Университет',         en: 'University',       kz: 'Университет' },
  'mo.uniPh':   { ru: 'Например: MIT, НУ, КБТУ', en: 'E.g.: MIT, NU, KBTU', kz: 'Мысалы: MIT, НУ, КБТУ' },
  'mo.spec':    { ru: 'Специальность',       en: 'Speciality',       kz: 'Мамандық' },
  'mo.specPh':  { ru: 'Например: Computer Science', en: 'E.g.: Computer Science', kz: 'Мысалы: Computer Science' },
  'mo.about':   { ru: 'О себе',             en: 'About me',         kz: 'Өзім туралы' },
  'mo.aboutPh': { ru: 'Расскажи студентам о своём опыте и чем можешь помочь', en: 'Tell students about your experience and how you can help', kz: 'Тәжірибеңіз бен қалай көмектесе алатыныңыз туралы айтыңыз' },
  'mo.contacts':{ ru: 'Контакты (необязательно)', en: 'Contacts (optional)', kz: 'Байланыс (міндетті емес)' },
  'mo.tgPh':    { ru: 'username в Telegram', en: 'Telegram username', kz: 'Telegram username' },
  'mo.phonePh': { ru: 'Номер телефона',     en: 'Phone number',     kz: 'Телефон нөмірі' },
  'mo.emailPh': { ru: 'Email для связи',   en: 'Contact email',    kz: 'Байланыс email' },
  'mo.done':    { ru: 'Готово 🎉',         en: 'Done 🎉',          kz: 'Дайын 🎉' },
  'mo.saving':  { ru: 'Сохраняем...',      en: 'Saving...',        kz: 'Сақтауда...' },
  'mo.saveErr': { ru: 'Ошибка сохранения', en: 'Save error',       kz: 'Сақтау қатесі' },

  // ── ChatBot ──────────────────────────────────────────────────────────────
  'chat.welcome': { ru: 'Привет! Я Ментора — твой AI-помощник 👋\n\nМогу рассказать об актуальных возможностях, курсах, дедлайнах или ответить на любой вопрос. Что тебя интересует?', en: 'Hi! I\'m Mentora — your AI assistant 👋\n\nI can tell you about current opportunities, courses, deadlines or answer any question. What would you like to know?', kz: 'Сәлем! Мен Ментора — сенің AI-көмекшің 👋\n\nАғымдағы мүмкіндіктер, курстар, мерзімдер туралы айта аламын немесе кез келген сұраққа жауап бере аламын. Не қызықтырады?' },
  'chat.s1':     { ru: 'Какие возможности подходят мне?',  en: 'What opportunities suit me?',       kz: 'Маған қандай мүмкіндіктер сай?' },
  'chat.s2':     { ru: 'Покажи ближайшие дедлайны',        en: 'Show nearest deadlines',             kz: 'Жақын мерзімдерді көрсет' },
  'chat.s3':     { ru: 'Какие курсы есть на платформе?',   en: 'What courses are on the platform?',  kz: 'Платформада қандай курстар бар?' },
  'chat.ph':     { ru: 'Напиши сообщение...',              en: 'Type a message...',                  kz: 'Хабарлама жаз...' },
  'chat.sub':    { ru: 'AI-помощник платформы',            en: 'Platform AI assistant',              kz: 'Платформаның AI-көмекшісі' },
  'chat.clear':  { ru: 'Очистить чат',                     en: 'Clear chat',                         kz: 'Чатты тазалау' },
  'chat.open':   { ru: 'Открыть чат',                      en: 'Open chat',                          kz: 'Чатты ашу' },
  'chat.err1':   { ru: 'Не удалось получить ответ. Попробуй позже.', en: 'Failed to get a response. Try again later.', kz: 'Жауап алу мүмкін болмады. Кейінірек қайталаңыз.' },
  'chat.err2':   { ru: 'Что-то пошло не так. Попробуй ещё раз.', en: 'Something went wrong. Try again.', kz: 'Бірдеңе дұрыс болмады. Қайталап көр.' },
  'chat.errPfx': { ru: 'Ошибка: ',                        en: 'Error: ',                            kz: 'Қате: ' },

  // ── PostCard ─────────────────────────────────────────────────────────────
  'post.details':   { ru: 'Подробнее',     en: 'Learn more',   kz: 'Толығырақ' },
  'post.deleteQ':   { ru: 'Удалить пост?', en: 'Delete post?', kz: 'Жазбаны жою?' },
  'post.yes':       { ru: 'Да',            en: 'Yes',          kz: 'Иә' },
  'post.no':        { ru: 'Нет',           en: 'No',           kz: 'Жоқ' },
  'post.daysLeft':  { ru: '{n} дн. осталось', en: '{n} days left', kz: '{n} күн қалды' },
  'post.until':     { ru: 'до {date}',     en: 'until {date}', kz: '{date} дейін' },
  'post.locale':    { ru: 'ru-RU',         en: 'en-US',        kz: 'kk-KZ' },
} as const

export type TKey = keyof typeof dict

export function t(key: TKey, lang: Lang, vars?: Record<string, string>): string {
  const entry = dict[key] as Record<Lang, string> | undefined
  let str = entry?.[lang] ?? entry?.['ru'] ?? String(key)
  if (vars) {
    str = str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
  }
  return str
}
