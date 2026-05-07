/**
 * Internationalization (i18n) module
 * Supports: EN, UA, RU, PT, DE, FR
 */

const I18n = (() => {
  const translations = {
    en: {
      appTitle: "CNC-Tools — Drill Optimizer",
      secLoadFile: "Load Excellon File",
      secManual: "Manual Input",
      secOptimization: "Optimization",
      secGcodeSettings: "G-code Settings",
      secStatistics: "Statistics",
      dropZone: "Drop .drl file here or click to browse",
      lblTools: "Tools:",
      lblHoles: "Holes:",
      thNum: "#",
      thDia: "Dia (mm)",
      thX: "X",
      thY: "Y",
      thTool: "Tool#",
      btnAddTool: "+ Tool",
      btnAddHole: "+ Hole",
      btnLoadManual: "Load Manual Data",
      lbl2optIter: "2-opt iterations",
      lblTimeLimit: "Time limit (ms)",
      btnOptimize: "Optimize Path",
      lblFeedRate: "Feed rate (mm/min)",
      lblPlungeRate: "Plunge rate (mm/min)",
      lblDrillDepth: "Drill depth (mm)",
      lblSafeHeight: "Safe height (mm)",
      lblSpindleRPM: "Spindle RPM",
      lblDwell: "Dwell at bottom",
      btnGenerate: "Generate G-code",
      tabOriginal: "Original",
      tabOptimized: "Optimized",
      tabComparison: "Comparison",
      tabAnimation: "Animation",
      lblSpeed: "Speed:",
      gcodeHeader: "G-code Output (editable)",
      btnCopy: "Copy",
      btnDownload: "Download .nc",
      gcodePlaceholder: "G-code will appear here after generation. You can edit it before saving.",
      statusReady: "Ready — load an Excellon drill file or enter holes manually",
      lblFile: "File:",
      lblUnits: "Units:",
      lblFormat: "Format:",
      lblZeroSup: "Zero suppression:",
      lblToolsCount: "Tools:",
      lblHolesCount: "Holes:",
      statTotalHoles: "Total holes:",
      statOrigDist: "Original distance:",
      statOptDist: "Optimized distance:",
      statImprovement: "Improvement:",
      statToolChanges: "Tool changes:",
      statHolesUnit: "holes",
      msgLoaded: "Loaded: {name} — {holes} holes, {tools} tools",
      msgManualLoaded: "Manual data loaded: {holes} holes, {tools} tools",
      msgOptimizing: "Optimizing...",
      msgOptimized: "Optimized! Distance: {dist}mm (saved {pct}%)",
      msgGcodeGenerated: "G-code generated: {lines} lines",
      msgGcodeCopied: "G-code copied to clipboard",
      msgNoData: "Load a drill file or enter manual data first",
      msgNoResult: "Run optimization first",
      msgAddData: "Add at least one tool and one hole",
      msgParseError: "Error parsing file: {err}",
      msgGcodeValid: "G-code validated OK",
      msgReparse: "Re-parse: reload the file to apply format changes",
      validatedOk: "G-code validated OK"
    },

    uk: {
      appTitle: "CNC-Tools — Оптимізатор свердління",
      secLoadFile: "Завантажити Excellon файл",
      secManual: "Ручне введення",
      secOptimization: "Оптимізація",
      secGcodeSettings: "Налаштування G-code",
      secStatistics: "Статистика",
      dropZone: "Перетягніть .drl файл сюди або натисніть для вибору",
      lblTools: "Інструменти:",
      lblHoles: "Отвори:",
      thNum: "№",
      thDia: "Діам. (мм)",
      thX: "X",
      thY: "Y",
      thTool: "Інстр.",
      btnAddTool: "+ Інструмент",
      btnAddHole: "+ Отвір",
      btnLoadManual: "Завантажити вручну",
      lbl2optIter: "Ітерації 2-opt",
      lblTimeLimit: "Ліміт часу (мс)",
      btnOptimize: "Оптимізувати шлях",
      lblFeedRate: "Подача (мм/хв)",
      lblPlungeRate: "Врізання (мм/хв)",
      lblDrillDepth: "Глибина свердління (мм)",
      lblSafeHeight: "Безпечна висота (мм)",
      lblSpindleRPM: "Оберти шпинделя",
      lblDwell: "Затримка внизу",
      btnGenerate: "Генерувати G-code",
      tabOriginal: "Оригінал",
      tabOptimized: "Оптимізовано",
      tabComparison: "Порівняння",
      tabAnimation: "Анімація",
      lblSpeed: "Швидкість:",
      gcodeHeader: "G-code вихід (редагований)",
      btnCopy: "Копіювати",
      btnDownload: "Завантажити .nc",
      gcodePlaceholder: "G-code з'явиться тут після генерації. Ви можете редагувати його перед збереженням.",
      statusReady: "Готово — завантажте Excellon файл або введіть отвори вручну",
      lblFile: "Файл:",
      lblUnits: "Одиниці:",
      lblFormat: "Формат:",
      lblZeroSup: "Подавл. нулів:",
      lblToolsCount: "Інструменти:",
      lblHolesCount: "Отвори:",
      statTotalHoles: "Всього отворів:",
      statOrigDist: "Оригінальна відстань:",
      statOptDist: "Оптимізована відстань:",
      statImprovement: "Покращення:",
      statToolChanges: "Зміни інструменту:",
      statHolesUnit: "отв.",
      msgLoaded: "Завантажено: {name} — {holes} отв., {tools} інстр.",
      msgManualLoaded: "Ручні дані завантажено: {holes} отв., {tools} інстр.",
      msgOptimizing: "Оптимізація...",
      msgOptimized: "Оптимізовано! Відстань: {dist}мм (зекономлено {pct}%)",
      msgGcodeGenerated: "G-code згенеровано: {lines} рядків",
      msgGcodeCopied: "G-code скопійовано",
      msgNoData: "Завантажте файл або введіть дані вручну",
      msgNoResult: "Спочатку запустіть оптимізацію",
      msgAddData: "Додайте хоча б один інструмент та один отвір",
      msgParseError: "Помилка парсингу: {err}",
      msgGcodeValid: "G-code перевірено — OK",
      msgReparse: "Перезавантажте файл для зміни формату",
      validatedOk: "G-code перевірено — OK"
    },

    ru: {
      appTitle: "CNC-Tools — Оптимизатор сверловки",
      secLoadFile: "Загрузить Excellon файл",
      secManual: "Ручной ввод",
      secOptimization: "Оптимизация",
      secGcodeSettings: "Настройки G-code",
      secStatistics: "Статистика",
      dropZone: "Перетащите .drl файл сюда или нажмите для выбора",
      lblTools: "Инструменты:",
      lblHoles: "Отверстия:",
      thNum: "№",
      thDia: "Диам. (мм)",
      thX: "X",
      thY: "Y",
      thTool: "Инстр.",
      btnAddTool: "+ Инструмент",
      btnAddHole: "+ Отверстие",
      btnLoadManual: "Загрузить вручную",
      lbl2optIter: "Итерации 2-opt",
      lblTimeLimit: "Лимит времени (мс)",
      btnOptimize: "Оптимизировать путь",
      lblFeedRate: "Подача (мм/мин)",
      lblPlungeRate: "Врезание (мм/мин)",
      lblDrillDepth: "Глубина сверловки (мм)",
      lblSafeHeight: "Безопасная высота (мм)",
      lblSpindleRPM: "Обороты шпинделя",
      lblDwell: "Задержка внизу",
      btnGenerate: "Сгенерировать G-code",
      tabOriginal: "Оригинал",
      tabOptimized: "Оптимизировано",
      tabComparison: "Сравнение",
      tabAnimation: "Анимация",
      lblSpeed: "Скорость:",
      gcodeHeader: "G-code вывод (редактируемый)",
      btnCopy: "Копировать",
      btnDownload: "Скачать .nc",
      gcodePlaceholder: "G-code появится здесь после генерации. Вы можете редактировать его перед сохранением.",
      statusReady: "Готово — загрузите Excellon файл или введите отверстия вручную",
      lblFile: "Файл:",
      lblUnits: "Единицы:",
      lblFormat: "Формат:",
      lblZeroSup: "Подавл. нулей:",
      lblToolsCount: "Инструменты:",
      lblHolesCount: "Отверстия:",
      statTotalHoles: "Всего отверстий:",
      statOrigDist: "Оригинальное расстояние:",
      statOptDist: "Оптимизированное расстояние:",
      statImprovement: "Улучшение:",
      statToolChanges: "Смены инструмента:",
      statHolesUnit: "отв.",
      msgLoaded: "Загружено: {name} — {holes} отв., {tools} инстр.",
      msgManualLoaded: "Ручные данные загружены: {holes} отв., {tools} инстр.",
      msgOptimizing: "Оптимизация...",
      msgOptimized: "Оптимизировано! Расстояние: {dist}мм (сэкономлено {pct}%)",
      msgGcodeGenerated: "G-code сгенерирован: {lines} строк",
      msgGcodeCopied: "G-code скопирован",
      msgNoData: "Загрузите файл или введите данные вручную",
      msgNoResult: "Сначала запустите оптимизацию",
      msgAddData: "Добавьте хотя бы один инструмент и одно отверстие",
      msgParseError: "Ошибка парсинга: {err}",
      msgGcodeValid: "G-code проверен — OK",
      msgReparse: "Перезагрузите файл для смены формата",
      validatedOk: "G-code проверен — OK"
    },

    pt: {
      appTitle: "CNC-Tools — Otimizador de Furação",
      secLoadFile: "Carregar arquivo Excellon",
      secManual: "Entrada manual",
      secOptimization: "Otimização",
      secGcodeSettings: "Configurações G-code",
      secStatistics: "Estatísticas",
      dropZone: "Arraste o arquivo .drl aqui ou clique para procurar",
      lblTools: "Ferramentas:",
      lblHoles: "Furos:",
      thNum: "№",
      thDia: "Diâm. (mm)",
      thX: "X",
      thY: "Y",
      thTool: "Ferra.",
      btnAddTool: "+ Ferramenta",
      btnAddHole: "+ Furo",
      btnLoadManual: "Carregar dados manuais",
      lbl2optIter: "Iterações 2-opt",
      lblTimeLimit: "Limite de tempo (ms)",
      btnOptimize: "Otimizar caminho",
      lblFeedRate: "Avanço (mm/min)",
      lblPlungeRate: "Mergulho (mm/min)",
      lblDrillDepth: "Profundidade (mm)",
      lblSafeHeight: "Altura segura (mm)",
      lblSpindleRPM: "RPM do spindle",
      lblDwell: "Pausa no fundo",
      btnGenerate: "Gerar G-code",
      tabOriginal: "Original",
      tabOptimized: "Otimizado",
      tabComparison: "Comparação",
      tabAnimation: "Animação",
      lblSpeed: "Velocidade:",
      gcodeHeader: "Saída G-code (editável)",
      btnCopy: "Copiar",
      btnDownload: "Baixar .nc",
      gcodePlaceholder: "O G-code aparecerá aqui após a geração. Você pode editá-lo antes de salvar.",
      statusReady: "Pronto — carregue um arquivo Excellon ou insira furos manualmente",
      lblFile: "Arquivo:",
      lblUnits: "Unidades:",
      lblFormat: "Formato:",
      lblZeroSup: "Supressão zeros:",
      lblToolsCount: "Ferramentas:",
      lblHolesCount: "Furos:",
      statTotalHoles: "Total de furos:",
      statOrigDist: "Distância original:",
      statOptDist: "Distância otimizada:",
      statImprovement: "Melhoria:",
      statToolChanges: "Trocas de ferramenta:",
      statHolesUnit: "furos",
      msgLoaded: "Carregado: {name} — {holes} furos, {tools} ferramentas",
      msgManualLoaded: "Dados manuais carregados: {holes} furos, {tools} ferramentas",
      msgOptimizing: "Otimizando...",
      msgOptimized: "Otimizado! Distância: {dist}mm (economia {pct}%)",
      msgGcodeGenerated: "G-code gerado: {lines} linhas",
      msgGcodeCopied: "G-code copiado",
      msgNoData: "Carregue um arquivo ou insira dados manualmente",
      msgNoResult: "Execute a otimização primeiro",
      msgAddData: "Adicione pelo menos uma ferramenta e um furo",
      msgParseError: "Erro ao analisar: {err}",
      msgGcodeValid: "G-code validado — OK",
      msgReparse: "Recarregue o arquivo para alterar o formato",
      validatedOk: "G-code validado — OK"
    },

    de: {
      appTitle: "CNC-Tools — Bohroptimierung",
      secLoadFile: "Excellon-Datei laden",
      secManual: "Manuelle Eingabe",
      secOptimization: "Optimierung",
      secGcodeSettings: "G-code Einstellungen",
      secStatistics: "Statistik",
      dropZone: ".drl Datei hierher ziehen oder klicken zum Durchsuchen",
      lblTools: "Werkzeuge:",
      lblHoles: "Bohrungen:",
      thNum: "Nr",
      thDia: "Durchm. (mm)",
      thX: "X",
      thY: "Y",
      thTool: "Wkz.",
      btnAddTool: "+ Werkzeug",
      btnAddHole: "+ Bohrung",
      btnLoadManual: "Manuelle Daten laden",
      lbl2optIter: "2-opt Iterationen",
      lblTimeLimit: "Zeitlimit (ms)",
      btnOptimize: "Pfad optimieren",
      lblFeedRate: "Vorschub (mm/min)",
      lblPlungeRate: "Eintauchen (mm/min)",
      lblDrillDepth: "Bohrtiefe (mm)",
      lblSafeHeight: "Sichere Hoehe (mm)",
      lblSpindleRPM: "Spindel U/min",
      lblDwell: "Verweilen unten",
      btnGenerate: "G-code erzeugen",
      tabOriginal: "Original",
      tabOptimized: "Optimiert",
      tabComparison: "Vergleich",
      tabAnimation: "Animation",
      lblSpeed: "Geschw.:",
      gcodeHeader: "G-code Ausgabe (editierbar)",
      btnCopy: "Kopieren",
      btnDownload: "Download .nc",
      gcodePlaceholder: "G-code wird nach der Erstellung hier angezeigt. Sie koennen ihn vor dem Speichern bearbeiten.",
      statusReady: "Bereit — Excellon-Datei laden oder Bohrungen manuell eingeben",
      lblFile: "Datei:",
      lblUnits: "Einheiten:",
      lblFormat: "Format:",
      lblZeroSup: "Nullunterdr.:",
      lblToolsCount: "Werkzeuge:",
      lblHolesCount: "Bohrungen:",
      statTotalHoles: "Bohrungen gesamt:",
      statOrigDist: "Urspr. Distanz:",
      statOptDist: "Optim. Distanz:",
      statImprovement: "Verbesserung:",
      statToolChanges: "Werkzeugwechsel:",
      statHolesUnit: "Bohr.",
      msgLoaded: "Geladen: {name} — {holes} Bohrungen, {tools} Werkzeuge",
      msgManualLoaded: "Manuelle Daten geladen: {holes} Bohrungen, {tools} Werkzeuge",
      msgOptimizing: "Optimiere...",
      msgOptimized: "Optimiert! Distanz: {dist}mm (gespart {pct}%)",
      msgGcodeGenerated: "G-code erzeugt: {lines} Zeilen",
      msgGcodeCopied: "G-code kopiert",
      msgNoData: "Datei laden oder Daten manuell eingeben",
      msgNoResult: "Zuerst Optimierung ausfuehren",
      msgAddData: "Mindestens ein Werkzeug und eine Bohrung hinzufuegen",
      msgParseError: "Fehler beim Parsen: {err}",
      msgGcodeValid: "G-code validiert — OK",
      msgReparse: "Datei neu laden zum Aendern des Formats",
      validatedOk: "G-code validiert — OK"
    },

    fr: {
      appTitle: "CNC-Tools — Optimisation de perçage",
      secLoadFile: "Charger fichier Excellon",
      secManual: "Saisie manuelle",
      secOptimization: "Optimisation",
      secGcodeSettings: "Paramètres G-code",
      secStatistics: "Statistiques",
      dropZone: "Glissez un fichier .drl ici ou cliquez pour parcourir",
      lblTools: "Outils:",
      lblHoles: "Trous:",
      thNum: "N°",
      thDia: "Diam. (mm)",
      thX: "X",
      thY: "Y",
      thTool: "Outil",
      btnAddTool: "+ Outil",
      btnAddHole: "+ Trou",
      btnLoadManual: "Charger données manuelles",
      lbl2optIter: "Itérations 2-opt",
      lblTimeLimit: "Limite de temps (ms)",
      btnOptimize: "Optimiser le parcours",
      lblFeedRate: "Avance (mm/min)",
      lblPlungeRate: "Plongée (mm/min)",
      lblDrillDepth: "Profondeur (mm)",
      lblSafeHeight: "Hauteur sécurité (mm)",
      lblSpindleRPM: "Broche (tr/min)",
      lblDwell: "Pause en bas",
      btnGenerate: "Générer G-code",
      tabOriginal: "Original",
      tabOptimized: "Optimisé",
      tabComparison: "Comparaison",
      tabAnimation: "Animation",
      lblSpeed: "Vitesse:",
      gcodeHeader: "Sortie G-code (modifiable)",
      btnCopy: "Copier",
      btnDownload: "Télécharger .nc",
      gcodePlaceholder: "Le G-code apparaîtra ici après génération. Vous pouvez le modifier avant de sauvegarder.",
      statusReady: "Prêt — chargez un fichier Excellon ou saisissez les trous manuellement",
      lblFile: "Fichier:",
      lblUnits: "Unités:",
      lblFormat: "Format:",
      lblZeroSup: "Suppr. zéros:",
      lblToolsCount: "Outils:",
      lblHolesCount: "Trous:",
      statTotalHoles: "Total trous:",
      statOrigDist: "Distance originale:",
      statOptDist: "Distance optimisée:",
      statImprovement: "Amélioration:",
      statToolChanges: "Changements d'outil:",
      statHolesUnit: "trous",
      msgLoaded: "Chargé: {name} — {holes} trous, {tools} outils",
      msgManualLoaded: "Données manuelles chargées: {holes} trous, {tools} outils",
      msgOptimizing: "Optimisation...",
      msgOptimized: "Optimisé! Distance: {dist}mm (économie {pct}%)",
      msgGcodeGenerated: "G-code généré: {lines} lignes",
      msgGcodeCopied: "G-code copié",
      msgNoData: "Chargez un fichier ou saisissez les données manuellement",
      msgNoResult: "Lancez d'abord l'optimisation",
      msgAddData: "Ajoutez au moins un outil et un trou",
      msgParseError: "Erreur de parsing: {err}",
      msgGcodeValid: "G-code validé — OK",
      msgReparse: "Rechargez le fichier pour changer le format",
      validatedOk: "G-code validé — OK"
    }
  };

  const langNames = {
    en: "English",
    uk: "Українська",
    ru: "Русский",
    pt: "Português",
    de: "Deutsch",
    fr: "Français"
  };

  let currentLang = "en";

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem("cnc-lang", lang);
    applyTranslations();
  }

  function getLanguage() {
    return currentLang;
  }

  function t(key, params) {
    const str = translations[currentLang][key] || translations.en[key] || key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : "{" + k + "}");
  }

  function applyTranslations() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      const text = t(key);
      if (el.tagName === "INPUT" && el.type !== "number" && el.type !== "range") {
        el.placeholder = text;
      } else if (el.tagName === "TEXTAREA") {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    // Update page title
    document.title = t("appTitle");

    // Update language selector display
    const langLabel = document.getElementById("lang-label");
    if (langLabel) langLabel.textContent = langNames[currentLang];
  }

  function init() {
    // Restore saved language
    const saved = localStorage.getItem("cnc-lang");
    if (saved && translations[saved]) {
      currentLang = saved;
    }

    // Build language selector dropdown
    const langBtn = document.getElementById("lang-btn");
    const langDropdown = document.getElementById("lang-dropdown");
    if (langBtn && langDropdown) {
      langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        langDropdown.style.display = langDropdown.style.display === "block" ? "none" : "block";
      });

      document.addEventListener("click", () => {
        langDropdown.style.display = "none";
      });

      langDropdown.innerHTML = Object.entries(langNames).map(([code, name]) =>
        `<div class="lang-option ${code === currentLang ? "active" : ""}" data-lang="${code}">${name}</div>`
      ).join("");

      langDropdown.addEventListener("click", (e) => {
        const option = e.target.closest(".lang-option");
        if (option) {
          setLanguage(option.dataset.lang);
          langDropdown.querySelectorAll(".lang-option").forEach(o => o.classList.remove("active"));
          option.classList.add("active");
          langDropdown.style.display = "none";
        }
      });
    }

    applyTranslations();
  }

  return { init, t, setLanguage, getLanguage, applyTranslations, langNames };
})();
