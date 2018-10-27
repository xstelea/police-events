import {stringify} from 'query-string';

export interface IGetEvent {
  locationname: string;
  type: string;
  DateTime: string;
}

export class PolisenService {
  private api = 'https://polisen.se/api/events';

  public get(params: Partial<IGetEvent> = {}) {
    return fetch(`${this.api}?${stringify(params)}`);
  }
}
