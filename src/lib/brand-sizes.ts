import * as cheerio from 'cheerio';
import { ReplaySubject, Subscription } from 'rxjs';
import { Requester } from './requester';
import { BrandsInfo } from './brands-list';

export interface BrandContent {
    brand:      string;
    path:       string;
    womens?:    GenderContent;
    mens?:      GenderContent;
    maternity?: GenderContent;
}

export interface GenderContent {
    [section:    string]: TablesContent[];
}

export interface TablesContent {
    heads:      string[];
    in:         string[][];
    cm:         string[][]
}

export class BrandSizes {
    private _url:           string;
    private _requester:     Requester;
    private _$:             CheerioStatic;
    private _brandContent:  BrandContent;
    private _currentGender: string;
    private _allGenders:    string[];

    public brandSize$:      ReplaySubject<BrandContent> = new ReplaySubject<BrandContent>(1);

    constructor(cookie: string, brand: BrandsInfo) {
        console.log(brand.name);

        this._url = brand.url;
        this._brandContent = {
            brand:      brand.name,
            path:       brand.url
        };

        this._allGenders = [];

        this._requester = new Requester(cookie);

        this._getInfos();
    }

    private _getInfos(): void {
        const reqSub: Subscription = this._requester.resultFromSite$.subscribe(
            (reqRes: string) => {
                this._$ = cheerio.load( reqRes, {
                    normalizeWhitespace: false,
                    xmlMode: false,
                    decodeEntities: true
                });

                this._parse();
                if(this._allGenders.length) {
                    this._requester.getUrl(this._allGenders[0]);
                }
                else {
                    this.brandSize$.next(this._brandContent);
                    reqSub.unsubscribe();
                }
            }
        );

        this._requester.getUrl(this._url);
    }

    private _parse(): void {
        if(this._allGenders.length === 0) this._getAllGenders();

        this._getCurrentGender();
        this._getTables();
    }

    private _getAllGenders(): void {
        const $links: CheerioElement[] = this._$('nav.tabs ul li a').toArray();
        $links.forEach( (link: CheerioElement) => this._allGenders.push(link.attribs.href) );
    }

    private _getCurrentGender(): void {
        const selectedGender: CheerioElement[] = this._$('nav.tabs ul li a.selected').toArray();
        const genderURL: string = selectedGender[0].attribs.href;

        this._currentGender = genderURL.split('/').pop();
        // remove it from allGenders
        const pos: number = this._allGenders.indexOf(genderURL);
        this._allGenders.splice(pos, 1);
        // add it to BrandContent
        this._brandContent[this._currentGender] = [];
    }

    private _getTables(): void {
        const $allTables: Cheerio = this._$('table');
        const genderContent: GenderContent = {};

        $allTables.each(
            (idx: number, el: CheerioElement) => {
                const section: string = el.parent.children[1].firstChild.data.replace('.', '');
                
                if(genderContent[section] === undefined) genderContent[section] = [];
                
                const tblNum: number = genderContent[section].length;

                genderContent[section].push({
                    heads:      [],
                    in:         [],
                    cm:         []
                });

                /* Fill Heads information */
                el.children[1].children[1].children.forEach(
                    (th: CheerioElement) => {
                        if(th.name && th.name === 'th') genderContent[section][tblNum].heads.push(th.firstChild.data);
                    }
                );

                /* Fill tables content */
                let trNum: number = 0;
                el.lastChild.children.forEach(
                    (tr: CheerioElement) => {
                        if(tr.name && tr.name === 'tr') {
                            genderContent[section][tblNum].in.push([]);
                            genderContent[section][tblNum].cm.push([]);

                            tr.children.forEach(
                                (td: CheerioElement) => {
                                    if(td.attribs && typeof td.attribs['data-in'] === "undefined") {
                                        if(td.firstChild) {
                                            genderContent[section][tblNum].in[trNum].push(td.firstChild.data);
                                            genderContent[section][tblNum].cm[trNum].push(td.firstChild.data);
                                        }
                                        else {
                                            console.log(' *** Empty first Col');
                                            console.log('     => Brand :   '+ this._brandContent.brand);
                                            console.log('     => Gender :  '+ this._currentGender);
                                            console.log('     => Section : '+ section);

                                            genderContent[section][tblNum].in[trNum].push('');
                                            genderContent[section][tblNum].cm[trNum].push('');
                                        }
                                    }
                                    if(td.name && td.name === 'td' && typeof td.attribs['data-in'] !== "undefined") {
                                        genderContent[section][tblNum].in[trNum].push(td.attribs['data-in']);
                                        genderContent[section][tblNum].cm[trNum].push(td.attribs['data-cm']);
                                    }
                                }
                            );
                            trNum++;
                        }
                    }
                );
            }
        );

        try {
            this._brandContent[this._currentGender] = genderContent;
        }
        catch(e) {
            console.log('     => Brand :   '+ this._brandContent.brand);
            console.log('     => Gender :  '+ this._currentGender);
            console.log(e);
            process.exit(1);
        }
    }
}
