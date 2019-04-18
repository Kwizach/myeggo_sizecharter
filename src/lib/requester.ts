import * as http from 'http';
import * as querystring from 'querystring';
import { ReplaySubject } from 'rxjs';

interface Options {
    hostname: string,
    port: number,
    path: string,
    method: string,
    headers: {
        'User-Agent': string,
        Cookie: string,
        Accept: string,
        Connection: string
    }
}

interface Params { [s: string]: string }

export class Requester {
    public resultFromSite$:  ReplaySubject<string> = new ReplaySubject<string>(1);

    private _options: Options = {
        hostname: 'www.sizecharter.com',
        port: 80,
        path: '/',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
            Cookie: '',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            Connection: 'keep-alive'
        }
    };

    /**
     * constructor
     */
    constructor(cookie?: string) {
        if(cookie) this._options.headers.Cookie = cookie;
    }

    /**
     * GET url
     */
    public getUrl(path:string, params?: Params): void {
        this._options.method = 'GET';
        this._options.path = path;
        this._call(params);
    }

    /**
     * POST url
     */
    public postUrl(path:string, params?: Params): void {  
        this._options.method = 'POST';
        this._options.path = path;
        this._call(params);
    }

    /**
     * Call and send the result to Observable
     */
    private _call(params?: Params): void {
        var strParams: string = ( params ) ? querystring.stringify(params) : '';

        if( params && this._options.method === 'GET' )
            this._options.path += '?'+strParams;

        var req: http.ClientRequest = http.request(
            this._options,
            (response: http.IncomingMessage) => {
                var str: string = '';

                // another chunk of data has been recieved, so append it to `str`
                response.on('data', (chunk) => { str += chunk; });
                
                // the whole response has been recieved, so we just print it out here
                response.on('end', 
                    () => {
                        this.resultFromSite$.next(str); 
                    }
                );
            }
        );
        
        if( params && this._options.method === 'POST') {
            req.write(strParams);
        }
        
        req.end();
    }
}