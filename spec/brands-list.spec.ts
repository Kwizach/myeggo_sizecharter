import { Subscription } from 'rxjs';

import { BrandsList, BrandsInfo } from '../src/lib/brands-list';

describe("BrandsList Class", () => {
    var myClass:        BrandsList;
    var brandListSub:   Subscription;
    var content:        string;

    beforeAll( () => {
        myClass = new BrandsList();
        content = '<ul id="list"><li><a href="totoH">totoD</a></li><li><a href="tutuH">tutuD</a></li></ul>'
    });

    it("Confirm parser return 2 element", (done) => {
        myClass.firstPage = content;
        brandListSub = myClass.listOfBrand$.subscribe(
            (res: BrandsInfo[]) => {
                expect(res.length).toEqual(2);
                done();
            }
        );
    });

    it("Confirm 1st element name to be totoD", (done) => {
        myClass.firstPage = content;
        brandListSub = myClass.listOfBrand$.subscribe(
            (res: BrandsInfo[]) => {
                expect(res[0].name).toEqual('totoD');
                done();
            }
        );
    });

    it("Confirm 1st element url to be totoH", (done) => {
        myClass.firstPage = content;
        brandListSub = myClass.listOfBrand$.subscribe(
            (res: BrandsInfo[]) => {
                expect(res[0].url).toEqual('totoH');
                done();
            }
        );
    });

    afterEach( () => {
        if(brandListSub) brandListSub.unsubscribe();
    });

});