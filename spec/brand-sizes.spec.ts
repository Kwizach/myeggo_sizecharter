import { Subscription } from 'rxjs';

import { COOKIE } from '../src/lib/global';
import { BrandSizes, BrandContent } from "../src/lib/brand-sizes";
import { BrandsInfo } from "../src/lib/brands-list";


describe("BrandSizes Class", () => {
    var myClass:        BrandSizes;
    var brandInfo:      BrandsInfo;
    var brandSizeSub:   Subscription;

    beforeAll( () => {
        brandInfo = {
            name:   "dockers",
            url:    "/brands/dockers/womens"
        }
        myClass = new BrandSizes(COOKIE, brandInfo);
    });


    it("Confirm there are 6 sections", (done) => {
        brandSizeSub = myClass.brandSize$.subscribe(
            (resBC: BrandContent) => {
                expect(Object.keys(resBC.womens).length).toBe(6);
                done();
            }
        );
    });

    it("Confirm there are Pants section has 2 tables", (done) => {
        brandSizeSub = myClass.brandSize$.subscribe(
            (resBC: BrandContent) => {
                expect(resBC.womens['Pants'].length).toBe(2);
                done();
            }
        );
    });

    it("Confirm that Pants table has 10 entries", (done) => {
        brandSizeSub = myClass.brandSize$.subscribe(
            (resBC: BrandContent) => {
                expect(resBC.womens['Pants'][0].in.length).toBe(10);
                done();
            }
        );
    });

    afterEach( () => {
        if(brandSizeSub) brandSizeSub.unsubscribe();
    });
});