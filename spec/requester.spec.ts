import { Subscription } from 'rxjs';

import { COOKIE } from '../src/lib/global';
import { Requester } from '../src/lib/requester';

describe("Requester Class", () => {
    var myClass:        Requester;
    var requesterSub:   Subscription;

    beforeAll( () => {
        myClass = new Requester(COOKIE);
    });

    it("Confirm requester do not return empty string", (done) => {
        myClass.getUrl('/brands/');
        requesterSub = myClass.resultFromSite$.subscribe(
            (res: string) => {
                expect(res.length).not.toEqual(0);
                done();
            }
        );
    });

    afterEach( () => {
        if(requesterSub) requesterSub.unsubscribe();
    });

});