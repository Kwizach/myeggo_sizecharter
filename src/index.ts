import { Subscription } from 'rxjs';
import { MongoClient, Db } from 'mongodb';

import { COOKIE, MONGO_URL } from './lib/global'; 
import { Requester } from './lib/requester';
import { BrandsList, BrandsInfo } from './lib/brands-list';
import { BrandSizes, BrandContent } from './lib/brand-sizes';


const siteRequester: Requester = new Requester(COOKIE);
const brands: BrandsList = new BrandsList();

// Create a new MongoClient
const client: MongoClient = new MongoClient( MONGO_URL, {useNewUrlParser: true } );
let db: Db;

/**
 * Manage results from requester
 */
const firstPageSub: Subscription = siteRequester.resultFromSite$.subscribe(
    (reqRes: string) => {
        brands.firstPage = reqRes;
        firstPageSub.unsubscribe();
    }
);

/**
 * Retrieve list of Brands with  their URL
 */
const listOfBrandSub: Subscription = brands.listOfBrand$.subscribe(
    (bI: BrandsInfo[]) => {
        queryBrand(bI, 0);
        listOfBrandSub.unsubscribe();
    }
);

function queryBrand(brands: BrandsInfo[], idx: number) {    
    const brand = brands[idx];
    const brandContent: BrandSizes = new BrandSizes(COOKIE, brand);

    const brandSizeSub: Subscription = brandContent.brandSize$.subscribe(
        (bC: BrandContent) => {
            db.collection('brands').insertOne(bC, (err, result) => {
                brandSizeSub.unsubscribe();
                if(err) {
                    console.log(err);
                    client.close();
                    process.exit(1);
                }
                if(idx < brands.length-1) {
                    idx++;
                    queryBrand(brands, idx);
                }
                else {
                    client.close();
                }
            });
        }
    );
}


// Let's GO !!!
siteRequester.getUrl('/brands/');

client.connect(
    (err, client) => {
        if(err) {
            console.log('Error connecting to mongod server');
            process.exit(1);
        }
        console.log("Connected correctly to mongod server");
    
        db = client.db("sizecharter");
    
        siteRequester.getUrl('/brands/');
    }
);