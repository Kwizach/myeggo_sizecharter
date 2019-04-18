import * as cheerio from 'cheerio';
import { ReplaySubject } from 'rxjs';


export interface BrandsInfo { 
    name: string,
    url:    string
}

export class BrandsList {
    private _firstPage: string;
    public listOfBrand$: ReplaySubject<BrandsInfo[]> = new ReplaySubject<BrandsInfo[]>(1);
    public listOfBrand: BrandsInfo[] = [];

    constructor() {}

    set firstPage(result: string) {
        this._firstPage = result;
        this._parse();
    }

    private _parse(): void {
        const $ = cheerio.load( this._firstPage, {
            normalizeWhitespace: false,
            xmlMode: false,
            decodeEntities: true
        });
        const allAs: CheerioElement[] = $('ul#list > li > a').toArray();

        allAs.forEach(
            (el: CheerioElement) => this.listOfBrand.push({
                name:   el.firstChild.data,
                url:    el.attribs.href
            })
        );

        this.listOfBrand$.next(this.listOfBrand);
    }
}
