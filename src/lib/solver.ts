import type { SubjectKey } from './constants';

export interface SolverStep {
  title: string;
  // KaTeX string for the math expression (rendered). May be empty for text-only steps.
  math?: string;
  // Optional textual explanation under the math.
  text?: string;
  // Optional variation table rows for function study.
  table?: VariationTable;
  // Optional bulleted list of key points.
  bullets?: string[];
}

export interface VariationTable {
  x: (string | number)[];
  f: string[];
}

export interface SolverSolution {
  subject: SubjectKey;
  subjectAr: string;
  topic: string;
  summary: string;
  steps: SolverStep[];
}

export interface SmartSummary {
  bullets: string[];
  finalAnswer: string;
}

/* ------------------------------------------------------------------ */
/*  Subject detection                                                  */
/* ------------------------------------------------------------------ */

interface SubjectMeta {
  key: SubjectKey;
  ar: string;
  // Arabic + French + transliteration keywords for detection
  patterns: RegExp;
}

const SUBJECT_META: SubjectMeta[] = [
  {
    key: 'math',
    ar: 'الرياضيات',
    patterns:
      /رياضيات|math|fonction|derive|integral| limite|limite|نهاية|مشتقة|تكامل|دالة|معادلة|equation|inéquation|تربيعي|هندسة|geometry|مثلث|دائرة|زاوية|متجهات|vectors|احتمالات|statistique|إحصاء|حساب|arithmetic|suite|متتالية|exponentiel|logarithme|trigonométrie|cos|sin|tan|complexes|أعداد مركبة/i,
  },
  {
    key: 'physics',
    ar: 'الفيزياء',
    patterns:
      /فيزياء|physique|physique|force|velocity|كهرباء|magnetic|gravit|newton|طاقة|energy|مغناطيسي|كهربائي|مقاومة|résistance|تيار|courant|tension|حركة|mouvement|سرعة|vitesse|تسارع|accélération|optique|ضوء|lumière|ondes|موجات|heat|حرارة|température|غاز|gaz|ضغط|pression/i,
  },
  {
    key: 'science',
    ar: 'علوم الطبيعة والحياة',
    patterns:
      /علوم الطبيعة|علوم الحياة|science|biologie|خلية|cellule|cellule|dna|adn|arn|جين|gène|بروتين|protéine|تكاثر|reproduction|تنفس|respiration|photosynthèse|نبات|plante|نظام بيئي|écosystème|غذاء|nutrition|هضم|digestion|دوران|circulation|مناعة|immunitaire|عصب|nerf|هرمون|hormone|وراثة|hérédité|تطور|évolution|بيئة|environnement|كائن|organisme/i,
  },
  {
    key: 'arabic',
    ar: 'اللغة العربية',
    patterns:
      /لغة عربية|عربية|arabe|إعراب|تحليل|نحو|صرف|بلاغة|استعارة|تشبيه|كناية|مجاز|شعر|قصيدة|بحر|قافية|نثر|مقال|رواية|أدب|شاعر|إعراب|مفعول|مبتدأ|خبر|فعل|اسم|حرف|جملة|أسلوب|نداء|استفهام|تعجب|أمر|نهي|شرط|قسم|نص|قراءة|فهم|إجابة/i,
  },
  {
    key: 'history_geo',
    ar: 'التاريخ والجغرافيا',
    patterns:
      /تاريخ|جغرافيا|histoire|géographie|حرب|ثورة|conquête|معاهدة|treaty|دولة|empire|خلافة|ثورة التحرير|stèle|guerre|révolution|استعمار|colonisation|الجزائر|algeria|المغرب|العالم|الشرق|الغرب|موقع جغرافي|مناخ|climat|سكان|population|اقتصاد|تجارة|مدينة|دولة|حدود|frontières|مورد|ressource|قارة|continent|جبل|نهر|صحراء|متوسط|exode|هجرة/i,
  },
  {
    key: 'philosophy',
    ar: 'الفلسفة',
    patterns:
      /فلسفة|philosophie|philosophy|مفهوم|concept|الوجود|l'être|المعرفة|connaissance|الحقيقة|vérité|الحرية|liberté|العدالة|justice|العمل|travail|التقنية|technique|الإيمان|foi|العقل|raison|الدين|religion|الجمال|beau|الفن|art|الإرادة|volonté|السعادة|bonheur|المجتمع|société|الدولة|état|القانون|droit|الإنسان|homme|الغيلاف|leib|النفس|âme|المنهج|méthode|شك|doute|جدل|dialectique|مقال فلسفي|سؤال|إشكالية/i,
  },
  {
    key: 'french',
    ar: 'اللغة الفرنسية',
    patterns:
      /français|française|français|conjugaison|grammaire|vocabulaire|compréhension|expression|écrite|orale|texte|lecture|dissertation|résumé|essai|théâtre|poésie|roman|conjuguer|verbe|adjectif|nom|article|pronom|subjonctif|indicatif|conditionnel|impératif|passé|présent|futur|francophone/i,
  },
  {
    key: 'english',
    ar: 'اللغة الإنجليزية',
    patterns:
      /english|anglais|grammar|tense|vocabulary|comprehension|reading|writing|essay|passive|active|voice|reported speech|conditional|modal|phrasal verb|cloze|composition|dialogue|translation|irregular verb|present perfect|past simple|future/i,
  },
  {
    key: 'islamic',
    ar: 'العلوم الإسلامية',
    patterns:
      /إسلامية|تربية إسلامية|قرآن|حديث|فقه|عقيدة|تفسير|سيرة|نبوي|أحكام|عبادات|معاملات|زكاة|صلاة|صوم|حج|جهاد|إيمان|توحيد|sharia|fiqh|aqida|tafsir|sira|hadith|quran|coran|islamique|islam/i,
  },
  {
    key: 'accounting',
    ar: 'المحاسبة والتسيير المالي',
    patterns:
      /محاسبة|تسيير مالي|comptabilité|bilan|compte|résultat|amortissement|provision|facture|achat|vente|stock|inventaire|tva|comptable|financier|exploitation|charge|produit|actif|passif|débiteur|créditeur|journal|grand livre|balance/i,
  },
  {
    key: 'economics',
    ar: 'الاقتصاد والمانجمنت',
    patterns:
      /اقتصاد|مانجمنت|management|économie|entreprise|marché|offre|demande|prix|concurrence|monnaie|inflation|chômage|croissance|investissement|production|consommation|échange|commerce|exportation|importation|organisation|stratégie|marketing|rationalisation/i,
  },
  {
    key: 'law',
    ar: 'القانون',
    patterns:
      /قانون|droit|law|constitution|legislation|تشريع|قضاء|محكمة|عقد|contrat|مسؤولية|responsabilité|حق|devoir|التزام|دستور|مدني|تجاري|إداري|جنائي|جزائي|عقوبة|sanction|إجراء|procedure|juridiction|tribunal|محرر|statut|legal/i,
  },
  {
    key: 'mech_eng',
    ar: 'الهندسة الميكانيكية',
    patterns:
      /ميكانيكية|mécanique|mechanical|mécanique|engrenage|gear|couple|torque|axe|roulement|bearing|moteur|engine|hydraulique|pneumatique|cinématique|statique|résistance|poutre|force|moment|solide|liaison|mécanisme|construction|fabrication|usinage|soudure|tolérance|dessin technique/i,
  },
  {
    key: 'elec_eng',
    ar: 'الهندسة الكهربائية',
    patterns:
      /كهربائية|électrique|electrical|circuit|thyristor|transistor|diode|alternateur|moteur|bobine|condensateur|régime|triphasé|monophasé|transformateur|redresseur|onduleur|asservissement|automatisme|capteur|actionneur|arduino|pic|courant continu|courant alternatif|impédance|loi d'ohm|kirchhoff/i,
  },
  {
    key: 'civil_eng',
    ar: 'الهندسة المدنية',
    patterns:
      /مدنية|civile|civil|béton|armé|contrainte|compression|traction|poutre|poteau|fondation|semelle|sol|béton|acier|ferraillage|plan|structure|charpente|escalier|mur|porteur|charge|descente|géotechnique|topographie|coffrage|dosage|bâtiment|construction/i,
  },
  {
    key: 'process_eng',
    ar: 'هندسة الطرائق',
    patterns:
      /الطرائق|procédés|process|chimique|réaction|distillation|extraction|absorption|échangeur|thermique|chaleur|masse|bilan|matière|thermodynamique|chimie|catalyseur|distillation|évaporation|séchage|filtration|pompe|turbine|fluide|pression|débit|transfert|réacteur/i,
  },
  {
    key: 'italian',
    ar: 'اللغة الإيطالية',
    patterns:
      /italiano|italiana|italian|italien|italiana|grammatica|vocabolario|comprensione|congiuntivo|passato|presente|futuro|testo|lettura|scrittura|italian|italiana/i,
  },
  {
    key: 'spanish',
    ar: 'اللغة الإسبانية',
    patterns:
      /español|española|spanish|espagnol|gramática|vocabulario|comprensión|lectura|escritura|subjuntivo|indicativo|pretérito|presente|futuro|texto|español|hispanohablante/i,
  },
  {
    key: 'german',
    ar: 'اللغة الألمانية',
    patterns:
      /deutsch|german|allemand|grammatik|wortschatz|verstehen|lesen|schreiben|konjunktiv|präteritum|präsens|futur|text|deutschsprachig/i,
  },
  {
    key: 'civic_ed',
    ar: 'التربية المدنية',
    patterns:
      /تربية مدنية|مدنية|civique|citoyenneté|citoyen|droits|devoirs|république|état|constitution|sécurité|routière|consommation|environnement|solidarité|civisme|education civique/i,
  },
  {
    key: 'tamazight',
    ar: 'اللغة الأمازيغية',
    patterns:
      /أمازيغية|amazigh|tamazight|ⵜⴰⵎⴰⵣⵉⵖⵜ|tamazight|amazigh|berbère|tifinagh|grammaire|vocabulaire|compréhension|expression|tamazight/i,
  },
  {
    key: 'informatics',
    ar: 'المعلوماتية',
    patterns:
      /معلوماتية|informatique|algorithm|algorithme|programmation|python|java|javascript|html|css|base de données|database|sql|réseau|network|binaire|logique|booléen|tableur|excel|boucle|condition|fonction|variable|tableau|algorithme|scratch|pseudocode|organigramme|informatique/i,
  },
];

const SUBJECT_AR: Record<SubjectKey, string> = {
  math: 'الرياضيات',
  physics: 'الفيزياء',
  science: 'علوم الطبيعة والحياة',
  arabic: 'اللغة العربية',
  french: 'اللغة الفرنسية',
  english: 'اللغة الإنجليزية',
  history_geo: 'التاريخ والجغرافيا',
  islamic: 'العلوم الإسلامية',
  philosophy: 'الفلسفة',
  accounting: 'المحاسبة والتسيير المالي',
  economics: 'الاقتصاد والمانجمنت',
  law: 'القانون',
  mech_eng: 'الهندسة الميكانيكية',
  elec_eng: 'الهندسة الكهربائية',
  civil_eng: 'الهندسة المدنية',
  process_eng: 'هندسة الطرائق',
  italian: 'اللغة الإيطالية',
  spanish: 'اللغة الإسبانية',
  german: 'اللغة الألمانية',
  civic_ed: 'التربية المدنية',
  tamazight: 'اللغة الأمازيغية',
  art_music: 'التربية الموسيقية والتشكيلية',
  pe: 'التربية البدنية والرياضية',
  informatics: 'المعلوماتية',
};

export function detectSubject(input: string): SubjectKey {
  for (const meta of SUBJECT_META) {
    if (meta.patterns.test(input)) return meta.key;
  }
  return 'general' as SubjectKey;
}

function subjectAr(key: SubjectKey): string {
  return SUBJECT_AR[key] ?? 'مادة عامة';
}

/* ------------------------------------------------------------------ */
/*  Math-specific solvers (preserved)                                  */
/* ------------------------------------------------------------------ */

type MathTopic = 'quadratic' | 'derivative' | 'limit' | 'general-math';

function detectMathTopic(input: string): MathTopic {
  const t = input.toLowerCase();
  if (/مشتقة|deriv|f'\(|derivée/.test(t)) return 'derivative';
  if (/نهاية|limite|limit|lim\b/.test(t)) return 'limit';
  if (/x\^2|دراسة دالة|تابع تربيعي|parabola|f\s*\(/.test(t)) return 'quadratic';
  return 'general-math';
}

function parseQuadratic(input: string): { a: number; b: number; c: number } | null {
  const t = ` ${input} `.replace(/−/g, '-');
  const eqMatch = t.match(/f\s*\(\s*x\s*\)\s*=\s*([^=]+)$/i);
  let poly = eqMatch ? eqMatch[1] : input;

  const aMatch = poly.match(/(-?\s*\d*\.?\d*)\s*\*?\s*x\s*\^?\s*2/i);
  const bMatch = poly
    .replace(/-?\s*\d*\.?\d*\s*\*?\s*x\s*\^?\s*2/i, '')
    .match(/(-?\s*\d*\.?\d*)\s*\*?\s*x(?!\s*\^)/i);
  const cleaned = poly
    .replace(/-?\s*\d*\.?\d*\s*\*?\s*x\s*\^?\s*2/i, '')
    .replace(/-?\s*\d*\.?\d*\s*\*?\s*x(?!\s*\^)/i, '');
  const cMatch = cleaned.match(/(-?\s*\d+\.?\d*)\s*(?!\*?\s*x)/);

  const toNum = (s: string | undefined | null, fallback: number): number => {
    if (!s) return fallback;
    const n = parseFloat(s.replace(/\s/g, ''));
    if (Number.isNaN(n)) return fallback;
    return n;
  };

  let a = 1;
  if (aMatch) {
    const raw = aMatch[1].replace(/\s/g, '');
    a = raw === '' || raw === '+' ? 1 : raw === '-' ? -1 : parseFloat(raw);
  }
  let b = 0;
  if (bMatch) {
    const raw = bMatch[1].replace(/\s/g, '');
    b = raw === '' || raw === '+' ? 1 : raw === '-' ? -1 : parseFloat(raw);
  }
  let c = 0;
  if (cMatch) c = toNum(cMatch[1], 0);

  if (!/x\s*\^?\s*2/i.test(poly)) return null;
  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) return null;
  return { a, b, c };
}

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/\.?0+$/, '');
}

function fmtSigned(n: number, first = false): string {
  const s = fmtNum(Math.abs(n));
  if (first) return n < 0 ? `-${s}` : s;
  return n < 0 ? ` - ${s}` : ` + ${s}`;
}

function quadraticSolution(a: number, b: number, c: number): SolverSolution {
  const steps: SolverStep[] = [];
  const fStr = `f(x) = ${fmtSigned(a, true)}x^2 ${fmtSigned(b)}x ${fmtSigned(c)}`;
  steps.push({
    title: '1. التعريف والشكل القياسي',
    math: fStr,
    text: 'الدالة المعطاة دالة تربيعية من الشكل f(x) = ax² + bx + c حيث a, b, c ثوابت حقيقية.',
  });

  const f0 = c;
  const f2 = a * 4 + b * 2 + c;
  steps.push({
    title: '2. حساب قيمتين خاصتين f(0) و f(2)',
    math: `\\begin{aligned} f(0) &= ${fmtSigned(a, true)}(0)^2 ${fmtSigned(
      b
    )}(0) ${fmtSigned(c)} = ${fmtNum(f0)} \\\\ f(2) &= ${fmtSigned(
      a,
      true
    )}(2)^2 ${fmtSigned(b)}(2) ${fmtSigned(c)} = ${fmtNum(f2)} \\end{aligned}`,
    text: 'f(0) تساوي الحد الثابت c، و f(2) نحسبها بالتعويض المباشر لـ x = 2.',
  });

  const alpha = -b / (2 * a);
  const beta = c - (b * b) / (4 * a);
  const vertexForm = `f(x) = ${fmtSigned(
    a,
    true
  )}\\left(x ${fmtSigned(alpha)}\\right)^2 ${fmtSigned(beta)}`;
  steps.push({
    title: '3. الشكل المتطرف (صيغة الرأس)',
    math: `\\alpha = \\dfrac{-b}{2a} = \\dfrac{-(${fmtSigned(
      b,
      true
    )})}{2 \\cdot ${fmtSigned(a, true)}} = ${fmtNum(
      alpha
    )} \\\\[6pt] \\beta = f(\\alpha) = ${fmtNum(
      beta
    )} \\\\[6pt] ${vertexForm}`,
    text: `رأس المنحنى S(α, β) = (${fmtNum(alpha)}, ${fmtNum(
      beta
    )}). هذه النقطة هي مركز تماثل القطع المكافئ.`,
  });

  const delta = b * b - 4 * a * c;
  let rootsText = '';
  let rootsMath = '';
  if (delta > 0) {
    const sq = Math.sqrt(delta);
    const x1 = (-b - sq) / (2 * a);
    const x2 = (-b + sq) / (2 * a);
    rootsText = `للمعادلة حلان حقيقيان مختلفان: x₁ = ${fmtNum(
      x1
    )} و x₂ = ${fmtNum(x2)}.`;
    rootsMath = `\\Delta = ${fmtSigned(b, true)}^2 - 4 \\cdot ${fmtSigned(
      a,
      true
    )} \\cdot ${fmtSigned(c, true)} = ${fmtNum(
      delta
    )} > 0 \\\\[6pt] x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} \\Rightarrow x_1 = ${fmtNum(
      x1
    )},\\ x_2 = ${fmtNum(x2)}`;
  } else if (delta === 0) {
    const x0 = -b / (2 * a);
    rootsText = `للمعادلة حل مزدوج: x₀ = ${fmtNum(x0)}.`;
    rootsMath = `\\Delta = 0 \\Rightarrow x_0 = \\dfrac{-b}{2a} = ${fmtNum(x0)}`;
  } else {
    rootsText = 'Δ < 0: لا توجد جذور حقيقية، الدالة لا تقطع محور الأفاصيل.';
    rootsMath = `\\Delta = ${fmtNum(delta)} < 0`;
  }
  steps.push({
    title: '4. حساب المميز Δ والجذور',
    math: rootsMath,
    text: rootsText,
  });

  const opens = a > 0;
  const extrema = `${opens ? 'min' : 'max'} = ${fmtNum(beta)}`;
  steps.push({
    title: '5. جدول تغيرات الدالة',
    text: opens
      ? `لأن a = ${fmtNum(a)} > 0 فإن الدالة تناقص ثم تزايد (على شكل U)، والحد الأدنى عند α = ${fmtNum(
          alpha
        )}.`
      : `لأن a = ${fmtNum(a)} < 0 فإن الدالة تزايد ثم تناقص (على شكل ∩)، والحد الأقصى عند α = ${fmtNum(
          alpha
        )}.`,
    table: {
      x: ['-\\infty', fmtNum(alpha), '+\\infty'],
      f: [
        opens ? '+\\infty' : '-\\infty',
        extrema,
        opens ? '+\\infty' : '-\\infty',
      ],
    },
  });

  return {
    subject: 'math',
    subjectAr: 'الرياضيات',
    topic: 'دراسة دالة تربيعية',
    summary: `تمت دراسة الدالة ${fStr}. الرأس S(${fmtNum(alpha)}, ${fmtNum(
      beta
    )})، المميز Δ = ${fmtNum(delta)}.`,
    steps,
  };
}

function derivativeSolution(input: string): SolverSolution {
  const q = parseQuadratic(input);
  const steps: SolverStep[] = [];
  if (q) {
    const { a, b } = q;
    const fp = `${fmtSigned(2 * a, true)}x ${fmtSigned(b)}`;
    steps.push({
      title: '1. تحديد الدالة',
      math: `f(x) = ${fmtSigned(a, true)}x^2 ${fmtSigned(b)}x ${fmtSigned(
        q.c
      )}`,
    });
    steps.push({
      title: '2. تطبيق قاعدة الاشتقاق',
      math: `\\dfrac{d}{dx}\\left(ax^n\\right) = a \\cdot n \\cdot x^{n-1} \\\\[6pt] \\dfrac{d}{dx}\\left(bx\\right) = b \\\\[6pt] \\dfrac{d}{dx}\\left(c\\right) = 0`,
      text: 'نطبق قاعدة القوة على كل حد على حدة.',
    });
    steps.push({
      title: "3. النتيجة f'(x)",
      math: `f'(x) = ${fp}`,
      text: `المشتقة دالة خطية. تنعدم عند x = ${fmtNum(-b / (2 * a))}.`,
    });
    return {
      subject: 'math',
      subjectAr: 'الرياضيات',
      topic: 'حساب المشتقة',
      summary: `f'(x) = ${fp}`,
      steps,
    };
  }
  steps.push({
    title: '1. قواعد الاشتقاق الأساسية',
    math:
      "(x^n)' = n x^{n-1} \\quad (uv)' = u'v + uv' \\quad \\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v - uv'}{v^2}",
  });
  steps.push({
    title: '2. تطبيق على التعبير المدخل',
    math: `f(x) = ${input}`,
    text: 'لم يتم التعرف على دالة تربيعية قياسية، راجع التعبير وحدد المعاملات.',
  });
  return {
    subject: 'math',
    subjectAr: 'الرياضيات',
    topic: 'مشتقة عامة',
    summary: 'تم تقديم القواعد العامة للاشتقاق.',
    steps,
  };
}

function limitSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. التعرف على شكل النهاية',
    math: `\\lim_{x \\to \\cdot} f(x)`,
    text: 'النهاية قد تكون عند نقطة منتهية أو عند اللانهاية. ندرس سلوك f.',
  });
  steps.push({
    title: '2. حالات اللانهاية للدوال المرجعية',
    math:
      '\\lim_{x \\to +\\infty} x^n = +\\infty \\quad (n>0) \\\\[6pt] \\lim_{x \\to +\\infty} \\dfrac{1}{x} = 0 \\quad \\lim_{x \\to 0} \\dfrac{1}{x} = \\pm\\infty',
  });
  steps.push({
    title: '3. التطبيق على التعبير',
    text: `بالنسبة للتعبير المدخل "${input.slice(0, 60)}"، نطبق قواعد حساب النهايات (الجمع، الضرب، القسمة) بعد تحديد الشكل غير المعيّن إن وجد.`,
  });
  return {
    subject: 'math',
    subjectAr: 'الرياضيات',
    topic: 'حساب نهاية دالة',
    summary: 'تم شرح قواعد النهايات وتطبيقها على التعبير المدخل.',
    steps,
  };
}

function generalMathSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. فهم المطلوب',
    text: `تم استلام التمرين: "${input.slice(0, 160)}". نحدد نوع المسألة (جبر، هندسة، تحليل، إحصاء...) والمطلوب بدقة.`,
  });
  steps.push({
    title: '2. المعطيات والمنهجية',
    text: 'نصنف المعطيات المتوفرة، نختار القاعدة أو النظرية الرياضية المناسبة، ثم نرسم خطة للحل خطوة بخطوة.',
  });
  steps.push({
    title: '3. التنفيذ والتحقق',
    text: 'ننفذ الحسابات بترتيب منطقي مع توضيح كل انتقال، ثم نتحقق من النتيجة بالتعويض أو التقدير التقريبي.',
  });
  return {
    subject: 'math',
    subjectAr: 'الرياضيات',
    topic: 'حل رياضي عام',
    summary: 'تم تطبيق منهجية رياضية عامة لحل التمرين المدخل.',
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Subject-specific solvers                                           */
/* ------------------------------------------------------------------ */

function physicsSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد المعطيات والمطلوب',
    text: `المسألة الفيزيائية: ${input.slice(0, 140)}. نبدأ بحصر الكميات المعطاة (بالرمز والقيمة والوحدة) وتحديد المجهول المطلوب حسابه.`,
  });
  steps.push({
    title: '2. القوانين الفيزيائية المرجعية',
    math:
      'F = m\\,a \\quad v = \\dfrac{d}{t} \\quad P = m\\,g \\quad U = R\\,I \\quad E_k = \\tfrac{1}{2}m v^2 \\quad W = F \\cdot d',
    text: 'نختار القانون الفيزيائي المناسب الذي يربط بين المعطيات والمطلوب.',
  });
  steps.push({
    title: '3. التطبيق العددي والوحدات',
    text: 'نحوّل جميع الكميات إلى الوحدات الدولية (SI) ثم نعزل المجهول رياضياً ونعوّض بالقيم العددية.',
  });
  steps.push({
    title: '4. حساب النتيجة والتحقق',
    text: 'نحسب النتيجة مع تحديد وحدتها الصحيحة، ثم نتحقق من واقعية القيمة (رتبة مقدار واتجاه) قبل الختم.',
  });
  return {
    subject: 'physics',
    subjectAr: 'الفيزياء',
    topic: 'حل مسألة فيزيائية',
    summary: 'منهجية: معطيات → قانون → تطبيق عددي → تحقق من الوحدات.',
    steps,
  };
}

function scienceSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. فهم السياق البيولوجي',
    text: `السؤال: ${input.slice(0, 140)}. نحدد الظاهرة المدروسة (خلية، وراثة، تنفس، تكاثر، نظام بيئي...) والمستوى التنظيمي المعني.`,
  });
  steps.push({
    title: '2. استحضار المعارف المرجعية',
    text: 'نعتمد على المفاهيم الأساسية للمنهاج الجزائري: بنية الخلية، آليات الوراثة، وظائف الأعضاء، العلاقات داخل النظام البيئي.',
  });
  steps.push({
    title: '3. التحليل والربط',
    text: 'نربط المعطيات (وثيقة، رسم، مخطط) بالمعارف النظرية، ونفسّر العلاقة بين البنية والوظيفة أو بين العوامل والاستجابات.',
  });
  steps.push({
    title: '4. صياغة الإجابة العلمية',
    text: 'نكتب الإجابة بلغة علمية دقيقة، نستعمل المصطلحات الصحيحة، وندعمها بمخطط أو رسم توضيحي عند الحاجة، ونختم بالاستنتاج.',
  });
  return {
    subject: 'science',
    subjectAr: 'علوم الطبيعة والحياة',
    topic: 'حل سؤال في علوم الطبيعة والحياة',
    summary: 'منهجية: سياق بيولوجي → معارف مرجعية → تحليل وربط → استنتاج علمي.',
    steps,
  };
}

function arabicSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. قراءة النص وتحديد نوعه',
    text: `نقرأ النص/السؤال بعناية: ${input.slice(0, 120)} ونحدد نوعه (شعر، نثر، مقال، حكاية...) وموضوعه العام.`,
  });
  steps.push({
    title: '2. تحديد المطلوب',
    text: 'نحدد طبيعة المطلوب بدقة: إعراب، تحليل بلاغي، تحديد الأفكار، استخراج الأساليب، بناء خطة، أو كتابة تعبير.',
  });
  steps.push({
    title: '3. تطبيق القواعد اللغوية والبلاغية',
    bullets: [
      'النحو: إعراب الكلمات حسب موقعها (مبتدأ، خبر، فعل، مفعول...).',
      'البلاغة: تحديد الصور البيانية (تشبيه، استعارة، كناية، مجاز) وأثرها.',
      'المعجم: توضيح المفردات الصعبة من سياقها.',
    ],
  });
  steps.push({
    title: '4. صياغة الإجابة',
    text: 'ننظّم الإجابة في فقرات مترابطة: مقدمة، عرض (نقاط أساسية مع الشواهد)، خاتمة. نلتزم بلغة عربية سليمة وواضحة.',
  });
  return {
    subject: 'arabic',
    subjectAr: 'اللغة العربية',
    topic: 'تحليل لغوي وأدبي',
    summary: 'منهجية: قراءة → تحديد المطلوب → تطبيق القواعد → صياغة منظمة.',
    steps,
  };
}

function historyGeoSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد الموضوع والإطار الزمني/المكاني',
    text: `السؤال: ${input.slice(0, 140)}. نحدد هل هو سؤال تاريخي (حدث، حركة، شخصية) أم جغرافي (ظاهرة، موقع، مورد) ونحدد الإطار الزمني أو المكاني.`,
  });
  steps.push({
    title: '2. استخراج المعطيات من الوثيقة',
    text: 'إن وجدت وثيقة، نستخرج منها المعطيات المباشرة (تواريخ، أرقام، أسماء، أماكن) دون تأويل ثم نربطها بالمعارف.',
  });
  steps.push({
    title: '3. تنظيم الإجابة',
    bullets: [
      'مقدمة: طرح الإشكالية أو التعريف بالظاهرة.',
      'العرض: تقديم الأسباب/الخصائص، ثم النتائج/التحولات، بالاعتماد على المعارف والوثائق.',
      'الخاتمة: استنتاج عام يجيب عن السؤال المطروح.',
    ],
  });
  steps.push({
    title: '4. التحقق والختم',
    text: 'نتأكد من دقة التواريخ والأسماء، ومن ترابط الفقرات، ونختم بخلاصة واضحة تجيب عن المطلوب.',
  });
  return {
    subject: 'history_geo',
    subjectAr: 'التاريخ والجغرافيا',
    topic: 'تحليل تاريخي/جغرافي',
    summary: 'منهجية: إطار → وثيقة → تنظيم (مقدمة/عرض/خاتمة) → خلاصة.',
    steps,
  };
}

function philosophySolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد الإشكالية',
    text: `نقرأ السؤال: ${input.slice(0, 130)}. نحوّله إلى إشكالية فلسفية دقيقة تطرح علاقة بين مفهومين أو موقفين متعارضين.`,
  });
  steps.push({
    title: '2. تخطيط المقال الفلسفي',
    bullets: [
      'مقدمة: تمهيد، طرح المشكلة، صياغة الإشكالية.',
      'التحليل: عرض موقف أول (أطروحة) مع الحجج والأمثلة.',
      'المناقشة: موقف نقيض (نقيض الأطروحة) مع التبرير.',
      'التركيب: تجاوز التناقض وبلورة موقف مركّب.',
      'الخاتمة: استنتاج يفتح أفق تأملي جديد.',
    ],
  });
  steps.push({
    title: '3. توظيف المراجع الفلسفية',
    text: 'ندعم التحليل بمواقف فلاسفة ومنظّرين مناسبين للإشكالية (ديكارت، كانط، ماركس، نيتشه، سارتر...) مع نسبة كل فكرة لصاحبها.',
  });
  steps.push({
    title: '4. صياغة المقال',
    text: 'نكتب بأسلوب فلسفي رصين، نربط الأفكار بعلاقات منطقية (لأن، إذن، لكن، غير أن...)، ونتجنب السرد الحشوي.',
  });
  return {
    subject: 'philosophy',
    subjectAr: 'الفلسفة',
    topic: 'مقال فلسفي',
    summary: 'منهجية: إشكالية → خطة (تحليل/مناقشة/تركيب) → مراجع → صياغة.',
    steps,
  };
}

function languageSolution(
  input: string,
  key: SubjectKey,
  arName: string,
  langName: string
): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: `1. فهم النص/السؤال بال${langName}`,
    text: `نقرأ ${input.slice(0, 120)} ونحدد نوع المطلوب: فهم نص، قواعد، ترجمة، كتابة، أو تطبيق لغوي.`,
  });
  steps.push({
    title: `2. تطبيق القواعد ال${langName}`,
    bullets: [
      'تحديد الأزمنة (Present, Past, Future) أو ما يقابلها.',
      'تحليل البنية النحوية (جملة، شرط، مبتدأ وفاعل).',
      'استخراج المفردات الأساسية ومعانيها من السياق.',
    ],
  });
  steps.push({
    title: '3. الإجابة',
    text: 'نجيب بلغة واضحة وصحيحة، نرفق بالترجمة أو الشرح حسب المطلوب، ونراجع التهجئة والترقيم.',
  });
  return {
    subject: key,
    subjectAr: arName,
    topic: `حل في ${arName}`,
    summary: `منهجية: فهم → قواعد → إجابة مصححة.`,
    steps,
  };
}

function islamicSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد نوع السؤال',
    text: `السؤال: ${input.slice(0, 130)}. نحدد هل هو في التفسير، الحديث، الفقه، العقيدة، أو السيرة النبوية.`,
  });
  steps.push({
    title: '2. استحضار النصوص الشرعية',
    text: 'نعتمد على الآيات القرآنية والأحاديث النبوية ذات الصلة، مع نسبتها لمصادرها بدقة (السورة، الراوي).',
  });
  steps.push({
    title: '3. الشرح والاستنباط',
    bullets: [
      'التفسير: شرح معاني الآيات وأسباب النزول إن وجدت.',
      'الفقه: استخراج الأحكام من الأدلة (وجوب، تحريم، استحباب).',
      'العقيدة: بيان أثر المفهوم على عقيدة المسلم وسلوكه.',
    ],
  });
  steps.push({
    title: '4. التطبيق والخاتمة',
    text: 'نربط الحكم بالواقع العملي، ونختم بفائدة أو دراسة تطبيقية مستنبطة.',
  });
  return {
    subject: 'islamic',
    subjectAr: 'العلوم الإسلامية',
    topic: 'حل في العلوم الإسلامية',
    summary: 'منهجية: نوع السؤال → نصوص شرعية → استنباط أحكام → تطبيق.',
    steps,
  };
}

function accountingSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد العملية المحاسبية',
    text: `المعطيات: ${input.slice(0, 130)}. نحدد نوع العملية (شراء، بيع، دفع، تحصيل، تسوية) والأطراف المعنية.`,
  });
  steps.push({
    title: '2. تحليل القيود المحاسبية',
    bullets: [
      'تحديد الحسابات المدينة (التي تزداد أصولاً أو مصاريف).',
      'تحديد الحسابات الدائنة (التي تزداد خصوماً أو إيرادات).',
      'احتساب المبالغ مع احتساب الرسوم (TVA) إن وجدت.',
    ],
  });
  steps.push({
    title: '3. تسجيل القيود',
    math: `\\begin{array}{|l|r|l|r|}\\hline \\text{الحساب} & \\text{مدين} & \\text{الحساب} & \\text{دائن} \\\\ \\hline \\text{---} & --- & \\text{---} & --- \\\\ \\hline \\end{array}`,
    text: 'نسجّل القيد في اليومية وفق مبدأ القيد المزدوج: لكل عملية مدين يقابله دائن بنفس المبلغ.',
  });
  steps.push({
    title: '4. الترحيل والتحقق',
    text: 'نرحّل إلى الأستاذ العام ثم نراجع الميزان، ونتأكد من توازن المدين والدائن قبل الختم.',
  });
  return {
    subject: 'accounting',
    subjectAr: 'المحاسبة والتسيير المالي',
    topic: 'حل عملية محاسبية',
    summary: 'منهجية: تحديد العملية → قيود → تسجيل → ترحيل وتحقق.',
    steps,
  };
}

function economicsSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد الظاهرة الاقتصادية',
    text: `الموضوع: ${input.slice(0, 130)}. نحدد الظاهرة (سوق، تضخم، نمو، بطالة...) والمتغيرات المرتبطة بها.`,
  });
  steps.push({
    title: '2. تحليل الآليات',
    bullets: [
      'تحديد العوامل المؤثرة (العرض والطلب، السياسة النقدية، الاستثمار).',
      'ربط العلاقة السببية بين المتغيرات.',
      'استعمال الأدوات التحليلية (منحنيات، معادلات، نسب).',
    ],
  });
  steps.push({
    title: '3. التقييم والاستنتاج',
    text: 'نقيم نتائج الظاهرة على الاقتصاد والمجتمع، ونقترح حلولاً أو سياسات تصحيحية مستندة إلى النظرية.',
  });
  return {
    subject: 'economics',
    subjectAr: 'الاقتصاد والمانجمنت',
    topic: 'تحليل اقتصادي',
    summary: 'منهجية: ظاهرة → آليات → تقييم واستنتاج.',
    steps,
  };
}

function lawSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد النظام القانوني المعني',
    text: `الحالة: ${input.slice(0, 130)}. نحدد فرع القانون (مدني، تجاري، إداري، جنائي) ونطاق تطبيقه.`,
  });
  steps.push({
    title: '2. تحديد النص القانوني',
    text: 'نستحضر النص التشريعي أو القاعدة القانونية المنطبقة (دستور، قانون مدني، قانون تجاري...) ونحدد مادته.',
  });
  steps.push({
    title: '3. التطبيق والاستنتاج',
    bullets: [
      'إسقاط النص القانوني على الوقائع المطروحة.',
      'تحديد الأثر القانوني (التزام، مسؤولية، جزاء).',
      'الخروج بالحكم القانوني المستنتج.',
    ],
  });
  return {
    subject: 'law',
    subjectAr: 'القانون',
    topic: 'تحليل قانوني',
    summary: 'منهجية: فرع القانون → نص مطبّق → تطبيق على الوقائع → حكم.',
    steps,
  };
}

function engineeringSolution(
  input: string,
  key: SubjectKey,
  arName: string,
  formulas: string
): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد المعطيات التقنية',
    text: `التمرين: ${input.slice(0, 130)}. نحدد المنظومة التقنية المدروسة والكميات المعطاة والمطلوبة.`,
  });
  steps.push({
    title: '2. القوانين والنماذج المرجعية',
    math: formulas,
    text: 'نختار النموذج أو القانون الهندسي المناسب (ميكانيك، كهرباء، بناء، طرائق) للربط بين المعطيات والمطلوب.',
  });
  steps.push({
    title: '3. التطبيق والحساب',
    text: 'نحترم وحدات القياس الدولية، نعزل المجهول ونعوّض بالقيم ثم نحسب النتيجة مع التحقق من واقعيتها.',
  });
  steps.push({
    title: '4. الختم',
    text: 'نقدّم النتيجة النهائية مع وحدتها، ونعلّق على قيمتها التقنية ومطابقتها للمعايير إن اقتضى.',
  });
  return {
    subject: key,
    subjectAr: arName,
    topic: `حل في ${arName}`,
    summary: 'منهجية: منظومة → قانون مرجعي → تطبيق عددي → ختم.',
    steps,
  };
}

function civicSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. تحديد الموضوع',
    text: `الموضوع: ${input.slice(0, 130)}. نحدد المحور (حقوق، واجبات، أمن، استهلاك، بيئة، تضامن).`,
  });
  steps.push({
    title: '2. المفاهيم المرجعية',
    text: 'نستحضر مفاهيم المواطنة: حقوق الإنسان، التضامن، المسؤولية، الأمن، الحفاظ على الممتلكات العامة.',
  });
  steps.push({
    title: '3. التحليل والإجابة',
    text: 'نربط الموضوع بالواقع الجزائري، ونوضّح دور المؤسسات والمواطن، ونختم بسلوك مدني مستنتج.',
  });
  return {
    subject: 'civic_ed',
    subjectAr: 'التربية المدنية',
    topic: 'تحليل تربية مدنية',
    summary: 'منهجية: موضوع → مفاهيم مواطنة → تحليل وسلوك.',
    steps,
  };
}

function tamazightSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. فهم النص',
    text: `نقرأ ${input.slice(0, 120)} ونحدد نوعه ومضمونه بالاعتماد على المعجم الأمازيغي.`,
  });
  steps.push({
    title: '2. القواعد والصرف',
    text: 'نطبق قواعد النحو الأمازيغي (الجملة الاسمية، الفعلية، الضمائر، الإسناد) على المثال المدروس.',
  });
  steps.push({
    title: '3. الإجابة',
    text: 'نجيب بالأمازيغية بلغة سليمة، ونوضّح المعنى ونربطه بالسياق الثقافي.',
  });
  return {
    subject: 'tamazight',
    subjectAr: 'اللغة الأمازيغية',
    topic: 'حل في اللغة الأمازيغية',
    summary: 'منهجية: فهم → قواعد → إجابة.',
    steps,
  };
}

function informaticsSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. فهم المشكلة',
    text: `المطلوب: ${input.slice(0, 130)}. نحدد المدخلات والمخرجات المطلوبة من البرنامج أو الخوارزمية.`,
  });
  steps.push({
    title: '2. تصميم الخوارزمية',
    bullets: [
      'تحديد المتغيرات الثابتة والمتغيّرة وأنواعها.',
      'رسم منظومة الحل: متتاليات، شروط (if)، حلقات (for/while).',
      'كتابة الخوارزمية بلغة شبه برمجية (pseudocode).',
    ],
  });
  steps.push({
    title: '3. الترميز',
    math: `\\texttt{algorithme} \\; \\to \\; \\texttt{code source} \\; \\to \\; \\texttt{exécution}`,
    text: 'نترجم الخوارزمية إلى لغة البرمجة المطلوبة (Python, Pascal...) ونراجع الصياغة.',
  });
  steps.push({
    title: '4. الاختبار والتحقق',
    text: 'نختبر البرنامج على حالات مختلفة (عادية، حدية، خاطئة) للتأكد من صحته وخلوه من الأخطاء.',
  });
  return {
    subject: 'informatics',
    subjectAr: 'المعلوماتية',
    topic: 'حل خوارزمي / برمجي',
    summary: 'منهجية: فهم → خوارزمية → ترميز → اختبار.',
    steps,
  };
}

function genericSolution(input: string): SolverSolution {
  const steps: SolverStep[] = [];
  steps.push({
    title: '1. فهم السؤال',
    text: `تم استلام التمرين: "${input.slice(0, 160)}". نبدأ بفهم المطلوب وتحديد المفاهيم الأساسية المتدخلة.`,
  });
  steps.push({
    title: '2. المنهجية المقترحة',
    text: 'نحدد المعطيات، نختار الأدوات والمفاهيم المناسبة، ثم ننفذ التحليل أو الحساب خطوة بخطوة مع التحقق من النتائج.',
  });
  steps.push({
    title: '3. صياغة الحل',
    text: 'نعرض كل خطوة بشكل واضح مع توضيح الانتقالات المنطقية، ونختم بالنتيجة النهائية مع وحدتها إن اقتضى.',
  });
  return {
    subject: 'math',
    subjectAr: 'مادة عامة',
    topic: 'حل تمرين عام',
    summary: 'تم تطبيق منهجية عامة لحل التمرين المدخل.',
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Main solver dispatch                                               */
/* ------------------------------------------------------------------ */

export function solveHomework(input: string, forcedSubject?: SubjectKey): SolverSolution {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      subject: 'math',
      subjectAr: 'مادة عامة',
      topic: 'لا يوجد مدخل',
      summary: 'الرجاء إدخال نص التمرين أو رفع ملف.',
      steps: [],
    };
  }

  const subject = forcedSubject && forcedSubject !== 'general' as SubjectKey
    ? forcedSubject
    : detectSubject(trimmed);

  // Math has rich sub-detection
  if (subject === 'math') {
    const mTopic = detectMathTopic(trimmed);
    switch (mTopic) {
      case 'quadratic': {
        const q = parseQuadratic(trimmed);
        if (q) return quadraticSolution(q.a, q.b, q.c);
        return generalMathSolution(trimmed);
      }
      case 'derivative':
        return derivativeSolution(trimmed);
      case 'limit':
        return limitSolution(trimmed);
      default:
        return generalMathSolution(trimmed);
    }
  }

  switch (subject) {
    case 'physics':
      return physicsSolution(trimmed);
    case 'science':
      return scienceSolution(trimmed);
    case 'arabic':
      return arabicSolution(trimmed);
    case 'history_geo':
      return historyGeoSolution(trimmed);
    case 'philosophy':
      return philosophySolution(trimmed);
    case 'french':
      return languageSolution(trimmed, 'french', 'اللغة الفرنسية', 'الفرنسية');
    case 'english':
      return languageSolution(trimmed, 'english', 'اللغة الإنجليزية', 'الإنجليزية');
    case 'italian':
      return languageSolution(trimmed, 'italian', 'اللغة الإيطالية', 'الإيطالية');
    case 'spanish':
      return languageSolution(trimmed, 'spanish', 'اللغة الإسبانية', 'الإسبانية');
    case 'german':
      return languageSolution(trimmed, 'german', 'اللغة الألمانية', 'الألمانية');
    case 'islamic':
      return islamicSolution(trimmed);
    case 'accounting':
      return accountingSolution(trimmed);
    case 'economics':
      return economicsSolution(trimmed);
    case 'law':
      return lawSolution(trimmed);
    case 'mech_eng':
      return engineeringSolution(trimmed, 'mech_eng', 'الهندسة الميكانيكية',
        'F = m\\,a \\quad C = I\\,\\Omega \\quad P = F \\cdot v \\quad W = M \\cdot \\theta');
    case 'elec_eng':
      return engineeringSolution(trimmed, 'elec_eng', 'الهندسة الكهربائية',
        'U = R\\,I \\quad P = U\\,I \\quad Z = \\sqrt{R^2 + X^2} \\quad \\eta = \\dfrac{P_u}{P_a}');
    case 'civil_eng':
      return engineeringSolution(trimmed, 'civil_eng', 'الهندسة المدنية',
        '\\sigma = \\dfrac{F}{S} \\quad \\sigma = E\\,\\varepsilon \\quad M = \\dfrac{q\\,L^2}{8}');
    case 'process_eng':
      return engineeringSolution(trimmed, 'process_eng', 'هندسة الطرائق',
        'Q = m\\,C\\,\\Delta T \\quad \\Phi = K\\,S\\,\\Delta T \\quad \\eta = 1 - \\dfrac{T_f}{T_c}');
    case 'civic_ed':
      return civicSolution(trimmed);
    case 'tamazight':
      return tamazightSolution(trimmed);
    case 'informatics':
      return informaticsSolution(trimmed);
    default:
      return genericSolution(trimmed);
  }
}

/* ------------------------------------------------------------------ */
/*  Smart Summary generator (تلخيص ذكي)                                */
/* ------------------------------------------------------------------ */

export function generateSmartSummary(solution: SolverSolution): SmartSummary {
  const bullets: string[] = [];

  // Topic as anchor bullet
  if (solution.topic && solution.topic !== 'لا يوجد مدخل') {
    bullets.push(`الموضوع: ${solution.topic}.`);
  }

  // Collect key points from each step
  for (const step of solution.steps) {
    if (step.bullets && step.bullets.length) {
      bullets.push(`${step.title}: ${step.bullets.join(' / ')}`);
    } else if (step.text) {
      // Condense the step text to its essence (first sentence / key phrase)
      const first = step.text.split(/[.؟!،]/)[0].trim();
      if (first) bullets.push(`${step.title}: ${first}`);
    } else if (step.math) {
      bullets.push(`${step.title}: ${step.math}`);
    }
  }

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const unique = bullets.filter((b) => {
    const k = b.slice(0, 40);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    bullets: unique.slice(0, 10),
    finalAnswer: solution.summary,
  };
}
