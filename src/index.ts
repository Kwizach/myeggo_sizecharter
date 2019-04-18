import { Subscription } from 'rxjs';
import { MongoClient, Db } from 'mongodb';

import { Requester } from './lib/requester';
import { BrandsList, BrandsInfo } from './lib/brands-list';
import { BrandSizes, BrandContent } from './lib/brand-sizes';

const mongo_url = 'mongodb://localhost:27017';
const cookie: string = '_ga=GA1.2.1035176319.1552060681; _gid=GA1.2.927759470.1552060681; _SizeFinder_session=L2QvNGhKOEhyWGZwU2Z0VnBOQlRyN1NiOUVHNHFuVnhPenJjUFgzVE1xZFR0L2c4NFp4aVF0dmIzREc5VFNlU1Rnei91YTB6WXdweEZ3UHkwZUpaRFI0UnQ5QURHbUlKTEFZbXd0SXRwaTFCZGJHRUJrR1U2R1RZY0FKSTdqN21HNmZpOElxUytkcDE4UlIxL1R0Q3lPS2JrMy9MRm5LNVEvMGZ3MHFxWlRhdGd3N2VGYXlZWHhGN0ZlYnhENkJiLS1QOFJNNUZBalY0cWwxNUVnY1pTbjlBPT0%3D--b428c99312c5a6db4310eb7c0c5647a5d5d5b31e; request_method=GET; __gads=ID=e9e144a62d8ffaf8:T=1552060681:S=ALNI_MZsU-ylqvH5xKbnUiB1m1TF1f0H3w';
const siteRequester: Requester = new Requester(cookie);
const brands: BrandsList = new BrandsList();

// Create a new MongoClient
const client: MongoClient = new MongoClient( mongo_url, {useNewUrlParser: true } );
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
    const brandContent: BrandSizes = new BrandSizes(cookie, brand);

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