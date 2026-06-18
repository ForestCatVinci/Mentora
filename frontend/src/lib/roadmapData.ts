import type { Lang } from './i18n'

export type RoadmapSection = { label: string; items: string[] }

const data: Record<Lang, Record<number, RoadmapSection[]>> = {
  ru: {
    8: [
      { label: 'Олимпиады', items: ['Зарегистрируйся на школьную олимпиаду по математике', 'Участвуй в олимпиаде по информатике', 'Пройди олимпиаду "Кенгуру"'] },
      { label: 'Навыки',    items: ['Начни учить Python', 'Прочитай 12 книг за год', 'Освой базовый английский (A2)'] },
    ],
    9: [
      { label: 'Конкурсы',   items: ['Участвуй в городских олимпиадах', 'Подай заявку на летнюю школу', 'Попробуй себя на хакатоне'] },
      { label: 'Подготовка', items: ['Начни готовиться к SAT/IELTS', 'Создай аккаунт на Coursera', 'Найди ментора в своей области'] },
    ],
    10: [
      { label: 'Достижения', items: ['Участвуй в республиканских олимпиадах', 'Пройди международную летнюю школу', 'Создай проект для портфолио'] },
      { label: 'Поступление',items: ['Сдай IELTS (цель: 7.0+)', 'Изучи требования вузов мечты', 'Начни писать эссе Common App'] },
    ],
    11: [
      { label: 'Финальный рывок', items: ['Подай документы в зарубежные вузы', 'Подай на стипендии (Болашак, Chevening)', 'Участвуй в международных олимпиадах'] },
      { label: 'Итоги',           items: ['Собери рекомендательные письма', 'Финализируй портфолио', 'Подготовься к интервью'] },
    ],
  },
  en: {
    8: [
      { label: 'Olympiads', items: ['Sign up for a school math olympiad', 'Compete in a computer science olympiad', 'Try the "Kangaroo" math contest'] },
      { label: 'Skills',    items: ['Start learning Python', 'Read 12 books this year', 'Master basic English (A2)'] },
    ],
    9: [
      { label: 'Competitions', items: ['Compete in city-level olympiads', 'Apply for a summer school', 'Try your first hackathon'] },
      { label: 'Preparation',  items: ['Start preparing for SAT/IELTS', 'Create a Coursera account', 'Find a mentor in your field'] },
    ],
    10: [
      { label: 'Achievements', items: ['Compete in national olympiads', 'Attend an international summer school', 'Build a portfolio project'] },
      { label: 'Admissions',   items: ['Take IELTS (target 7.0+)', 'Research your dream university requirements', 'Start writing your Common App essays'] },
    ],
    11: [
      { label: 'Final Push', items: ['Submit applications to universities abroad', 'Apply for scholarships (Bolashak, Chevening)', 'Compete in international olympiads'] },
      { label: 'Wrap-up',    items: ['Collect recommendation letters', 'Finalize your portfolio', 'Prepare for interviews'] },
    ],
  },
  kz: {
    8: [
      { label: 'Олимпиадалар', items: ['Мектеп математика олимпиадасына тіркелу', 'Информатика олимпиадасына қатысу', '"Кенгуру" математика байқауын тапсыру'] },
      { label: 'Дағдылар',     items: ['Python үйрене бастау', 'Жылына 12 кітап оқу', 'Базалық ағылшын тілін меңгеру (A2)'] },
    ],
    9: [
      { label: 'Байқаулар',  items: ['Қалалық олимпиадаларға қатысу', 'Жазғы мектепке өтінім беру', 'Бірінші хакатонды байқап көру'] },
      { label: 'Дайындық',   items: ['SAT/IELTS дайындығын бастау', 'Coursera аккаунтын жасау', 'Өз саласыңда тьютор табу'] },
    ],
    10: [
      { label: 'Жетістіктер', items: ['Республикалық олимпиадаларға қатысу', 'Халықаралық жазғы мектепке бару', 'Портфолио үшін жоба жасау'] },
      { label: 'Түсу',        items: ['IELTS тапсыру (мақсат: 7.0+)', 'Арман университеттердің талаптарын зерттеу', 'Common App эссесін жаза бастау'] },
    ],
    11: [
      { label: 'Соңғы сарп', items: ['Шетелдегі университеттерге құжаттар тапсыру', 'Стипендияларға өтінім беру (Болашақ, Chevening)', 'Халықаралық олимпиадаларға қатысу'] },
      { label: 'Нәтижелер', items: ['Ұсыныс хаттарын жинау', 'Портфолионы аяқтау', 'Сұхбатқа дайындалу'] },
    ],
  },
}

export function getRoadmapData(lang: Lang): Record<number, RoadmapSection[]> {
  return data[lang] ?? data.ru
}
