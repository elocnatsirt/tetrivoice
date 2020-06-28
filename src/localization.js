// Localization Support
//
// Default language set as English
// Get languages from langList
// Show settings page/dropdown menu for languages
// If user changes localization, look up & set translated commands
//

function loadLanguages() {
  const langId = document.getElementById('languagesDD');
  const langs = Object.keys(langList)
  for (const l of langs) {
    if (langList[l]["code"]) {
      if (langList[l]["code"] == 'en-US') {
        langId.options[langId.options.length] = new Option(l, langList[l]["code"], true, true);
      } else {
        langId.options[langId.options.length] = new Option(l, langList[l]["code"], false, false);
      }
    }
  }

  langId.addEventListener("change", function(){
    console.log('Changed language to ' + langId.options[langId.selectedIndex].innerHTML);
    currentLang = langId.options[langId.selectedIndex].innerHTML;
    recognition.lang = langList[currentLang]["code"];
    // Update displayed commands
    document.getElementById("rotate").innerHTML = langList[currentLang]["voiceCommands"]["rotate"].toUpperCase();
    document.getElementById("move").innerHTML = langList[currentLang]["voiceCommands"]["move"].toUpperCase();
    document.getElementById("drop").innerHTML = langList[currentLang]["voiceCommands"]["drop"].toUpperCase();
  });
}

//
// Language template
//
// '': {
//   code: '',
//   voiceCommands: {
//     rotate: '',
//     move: '',
//     drop: '',
//     swap: '',
//     spawn: ''
//   }
// },
//

const langList = {
  "Arabic (United Arab Emirates)": "ar-AE",
  "Arabic (Bahrain)": "ar-BH",
  "Arabic (Algeria)": "ar-DZ",
  "Arabic (Egypt)": "ar-EG",
  "Arabic (Israel)": "ar-IL",
  "Arabic (Iraq)": "ar-IQ",
  "Arabic (Jordan)": "ar-JO",
  "Arabic (Kuwait)": "ar-KW",
  "Arabic (Lebanon)": "ar-LB",
  "Arabic (Morocco)": "ar-MA",
  "Arabic (Oman)": "ar-OM",
  "Arabic (State of Palestine)": "ar-PS",
  "Arabic (Qatar)": "ar-QA",
  "Arabic (Saudi Arabia)": "ar-SA",
  "Arabic (Tunisia)": "ar-TN",
  "German (Germany)": "de-DE",
  "English (Australia)": {
    code: "en-AU",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Canada)": {
    code: "en-CA",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (United Kingdom)": {
    code: "en-GB",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Ghana)": {
    code: "en-GH",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Ireland)": {
    code: "en-IE",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (India)": {
    code: "en-IN",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Kenya)": {
    code: "en-KE",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Nigeria)": {
    code: "en-NG",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (New Zealand)": {
    code: "en-NZ",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Philippines)": {
    code: "en-PH",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Singapore)": {
    code: "en-SG",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (Tanzania)": {
    code: "en-TZ",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (United States)": {
    code: "en-US",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "English (South Africa)": {
    code: "en-ZA",
    voiceCommands: {
      rotate: "rotate",
      move: "move",
      drop: "drop",
      swap: "swap",
      spawn: "spawn"
    }
  },
  "Spanish (Argentina)": "es-AR",
  "Spanish (Bolivia)": "es-BO",
  "Spanish (Chile)": "es-CL",
  "Spanish (Colombia)": "es-CO",
  "Spanish (Costa Rica)": "es-CR",
  "Spanish (Dominican Republic)": "es-DO",
  "Spanish (Ecuador)": "es-EC",
  "Spanish (Spain)": "es-ES",
  "Spanish (Guatemala)": "es-GT",
  "Spanish (Honduras)": "es-HN",
  "Spanish (Mexico)": {
    code: "es-MX",
    voiceCommands: {
      rotate: 'girar',
      move: 'moverse',
      drop: 'soltar',
      swap: 'intercambiar',
      spawn: 'aparecer'
    }
  },
  "Spanish (Nicaragua)": "es-NI",
  "Spanish (Panama)": "es-PA",
  "Spanish (Peru)": "es-PE",
  "Spanish (Puerto Rico)": "es-PR",
  "Spanish (Paraguay)": "es-PY",
  "Spanish (El Salvador)": "es-SV",
  "Spanish (United States)": {
    code: "es-US",
    voiceCommands: {
      rotate: "girar",
      move: "moverse",
      drop: "soltar",
      swap: "intercambiar",
      spawn: "aparecer"
    }
  },
  "Spanish (Uruguay)": "es-UY",
  "Spanish (Venezuela)": "es-VE",
  "French (Canada)": {
    code: "fr-CA",
    voiceCommands: {
      rotate: "tourner",
      move: "bouge-toi",
      drop: "tomber",
      swap: "échanger",
      spawn: "frayer"
    }
  },
  "French (France)": {
    code: "fr-FR",
    voiceCommands: {
      rotate: "tourner",
      move: "bouge-toi",
      drop: "tomber",
      swap: "échanger",
      spawn: "frayer"
    }
  },
  "Italian (Italy)": "it-IT",
  "Japanese (Japan)": "ja-JP",
  "Korean (South Korea)": "ko-KR",
  "Dutch (Netherlands)": "nl-NL",
  "Dutch (Belgium)": "nl-BE",
  "Polish (Poland)": "pl-PL",
  "Portuguese (Brazil)": {
    code: "pt-BR",
    voiceCommands: {
      rotate: 'rodar',
      move: 'mover',
      drop: 'solta',
      swap: 'troca',
      spawn: 'desovar'
    }
  },
  "Russian (Russia)": {
    code: "ru-RU",
    voiceCommands: {
      rotate: 'поворот',
      move: 'шаг',
      drop: 'падение',
      swap: 'обмен',
      spawn: 'порождать'
    }
  },
  "Thai (Thailand)": "th-TH",
  "Turkish (Turkey)": "tr-TR",
  "Chinese, Mandarin (Simplified, China)": {
    code: 'zh-CN',
    voiceCommands: {
      rotate: '旋转',
      move: '移动',
      drop: '下降',
      swap: '交换',
      spawn: '产卵'
    }
  },
  "Chinese, Cantonese (Traditional, Hong Kong)": "zh-HK",
  "Chinese, Mandarin (Traditional, Taiwan)": "zh-TW (cmn-hans-tw)",
  "Bulgarian (Bulgaria)": "bg-BG",
  "Catalan (Spain)": "ca-ES",
  "Czech (Czech Republic)": "cs-CZ",
  "Danish (Denmark)": "da-DK",
  "Greek (Greece)": "el-GR",
  "Finnish (Finland)": "fi-FI",
  "Hebrew (Israel)": "he-IL",
  "Hindi (India)": {
    code: "hi-IN",
    voiceCommands: {
      rotate: 'घुमाएँ',
      move: 'चाल',
      drop: 'ड्रॉप',
      swap: 'विनिमय',
      spawn: 'अंडे'
    }
  },
  "Croatian (Croatia)": "hr-HR",
  "Hungarian (Hungary)": "hu-HU",
  "Indonesian (Indonesia)": "id-ID",
  "Lithuanian (Lithuania)": "lt-LT",
  "Latvian (Latvia)": "lv-LV",
  "Norwegian Bokmål (Norway)": "nb-NO",
  "Portuguese (Portugal)": "pt-PT",
  "Romanian (Romania)": "ro-RO",
  "Slovak (Slovakia)": "sk-SK",
  "Slovenian (Slovenia)": "sl-SI",
  "Serbian (Serbia)": "sr-RS",
  "Swedish (Sweden)": "sv-SE",
  "Ukrainian (Ukraine)": "uk-UA",
  "Vietnamese (Vietnam)": "vi-VN",
  "Afrikaans (South Africa)": "af-ZA",
  "Amharic (Ethiopia)": "am-ET",
  "Azerbaijani (Azerbaijan)": "az-AZ",
  "Bengali (Bangladesh)": "bn-BD",
  "Bengali (India)": "bn-IN",
  "Estonian (Estonia)": "et-EE",
  "Basque (Spain)": "eu-ES",
  "Persian (Iran)": "fa-IR",
  "Filipino (Philippines)": "fil-PH",
  "Galician (Spain)": "gl-ES",
  "Gujarati (India)": "gu-IN",
  "Armenian (Armenia)": "hy-AM",
  "Icelandic (Iceland)": "is-IS",
  "Javanese (Indonesia)": "jv-ID",
  "Georgian (Georgia)": "ka-GE",
  "Khmer (Cambodia)": "km-KH",
  "Kannada (India)": "kn-IN",
  "Lao (Laos)": "lo-LA",
  "Macedonian (North Macedonia)": "mk-MK",
  "Malayalam (India)": "ml-IN",
  "Mongolian (Mongolia)": "mn-MN",
  "Marathi (India)": "mr-IN",
  "Malay (Malaysia)": "ms-MY",
  "Burmese (Myanmar)": "my-MM",
  "Nepali (Nepal)": "ne-NP",
  "Punjabi (Gurmukhi, India)": "pa-guru-IN",
  "Sinhala (Sri Lanka)": "si-LK",
  "Albanian (Albania)": "sq-AL",
  "Sundanese (Indonesia)": "su-ID",
  "Swahili (Kenya)": "sw-KE",
  "Swahili (Tanzania)": "sw-TZ",
  "Tamil (India)": "ta-IN",
  "Tamil (Sri Lanka)": "ta-LK",
  "Tamil (Malaysia)": "ta-MY",
  "Tamil (Singapore)": "ta-SG",
  "Telugu (India)": "te-IN",
  "Urdu (India)": "ur-IN",
  "Urdu (Pakistan)": "ur-PK",
  "Uzbek (Uzbekistan)": "uz-UZ",
  "Zulu (South Africa)": "zu-ZA"
}
