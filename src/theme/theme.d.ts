import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: string;
      cardBg: string;
      boxShadow: string;
      text: string;
    };
  }
}