declare module 'react-i18next' {
  interface DefaultTFuncReturn {
    [key: string]: string;
  }

  interface Resources {
    en: {
      translation: {
        hello: string;
        language_button: string;
      };
    };
    ua: {
      translation: {
        hello: string;
        language_button: string;
      };
    };
  }
}
