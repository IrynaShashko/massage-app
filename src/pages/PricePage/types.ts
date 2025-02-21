type Service = {
  service: string;
  time?: string;
  price: string;
  description?: string;
};

export type Categories = {
  women: Service[];
  body: Service[];
  men: Service[];
  children: Service[];
  else: Service[];
};

export interface PricePagePropsType {
  language: string;
}
