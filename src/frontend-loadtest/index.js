const puppeteer = require('puppeteer');

process.on('unhandledRejection', async (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    await delay(1000000000); // Wait for a long time
});

(async () => {
    try {
        // Launch browser and open a new page
        const browser = await puppeteer.launch({ headless: false }); // headless: false will show the browser window
        const page = await browser.newPage();

        const randomWidth = Math.floor(Math.random() * (1920 - 800 + 1)) + 800; // Random width between 800 and 1920
        const randomHeight = Math.floor(Math.random() * (2080 - 600 + 1)) + 600; // Random height between 600 and 1080

        await page.setViewport({ width: randomWidth, height: randomHeight });

        // Navigate to the page
        await page.goto('https://otel.jessitron.honeydemo.io'); // Replace 'https://example.com' with your actual website URL


        const waitingOptions = { timeout: 10000 };
        consecutiveErrorCount = 0;
        while (true) {
            // Wait for the page to load
            try {
                if (Math.random() > 0.5) {
                    console.log("Reload page")
                    await page.evaluate(() => {
                        localStorage.clear();
                        sessionStorage.clear();
                    });
                    // hard-refresh, new session
                    await page.reload();
                    // this may or may not really empty their cart
                }
                console.log("Let's pick a product")
                await page.waitForSelector('[data-cy=product-card]', waitingOptions); // Wait for the product cards to appear
                // const products = await page.$('[data-cy=product-card]');
                // const productsCount = products?.length;
                // console.log('productsCount:', productsCount);
                // // if (productsCount > 0) {
                // //     break;
                // // }
                await randomDelay(); // Wait a bit
                // Click on the item's picture
                await page.click('[data-cy=product-card]');

                // now wait for the description to load
                await page.waitForFunction(() => {
                    const elem = document.querySelector('[data-cy="product-description"]');
                    return elem && elem.innerText.trim().length > 0;
                }, waitingOptions);

                // Sometimes we will change the currency
                dropdown = await page.waitForSelector('[data-cy=currency-switcher]', waitingOptions);
                if (dropdown && Math.random() > 0.5) {
                    console.log("Let's change the currency")
                    await page.click('[data-cy=currency-switcher]');
                    // choose a random option from the dropdown

                    await page.waitForSelector('[data-cy=currency-switcher] option', waitingOptions);

                    const options = await page.$$eval('select[data-cy=currency-switcher] option', (opts) => opts.map(option => option.value));
                    const currency = randomElement(options)

                    await page.select('[data-cy=currency-switcher]', currency);
                }

                // Wait for the item's page to load
                //   await page.waitForNavigation();
                //console.log("we have awaited the nagivation to the product page")
                await randomDelay(); // Wait a bit
                // Change the quantity dropdown
                console.log("Let's buy two!!")
                await page.waitForSelector('[data-cy=product-quantity]', waitingOptions); // Wait for the quantity dropdown to appear
                await page.select('[data-cy=product-quantity]', '2'); // Change the quantity to 2

                await randomDelay(); // W
                // Add to cart
                console.log("Let's add to cart")
                await page.waitForSelector('[data-cy=product-add-to-cart]', waitingOptions); // Wait for the add to cart button to appear
                await page.click('[data-cy=product-add-to-cart]', waitingOptions);

                console.log("does the cart load?")
                await page.waitForNavigation(waitingOptions);
                await randomDelay();
                consecutiveErrorCount = 0;

                // TODO: sometimes check out
                if (Math.random() > 0.3) {
                    console.log("yeah! buy the stuff!")
                    const checkoutButtonSelector = '[data-cy=checkout-place-order]'
                    await page.waitForSelector(checkoutButtonSelector, waitingOptions); // Wait for the add to cart button to 
                    await page.click(checkoutButtonSelector)
                } else if (Math.random() > 0.2) {
                    console.log("empty the cart")
                    const emptyCartButtonSelector = '[data-cy=empty-cart]'
                    await page.waitForSelector(emptyCartButtonSelector, waitingOptions); // Wait for the add to cart button to 
                    await page.click(emptyCartButtonSelector)
                    //await  page.waitForSelector('button') // anything will do
                }
            } catch (e) {
                consecutiveErrorCount++;
                if (consecutiveErrorCount > 5) {
                    console.log("We've had too many errors, stop trying")
                    throw e;
                }
                console.log("There was an error: ", e);
                console.log("Let's try again")
                await randomDelay();
            }

        }
        // Wait for a few seconds to simulate a user reading the page
        await delay(5000); // Wait for 5 seconds (5000 milliseconds)

        // Close the browser
        await browser.close();
    } catch (error) {
        console.error(error);
        console.log("How about I sit here a while so the browser stays open");
        await delay(1000000000); // Wait for a long time
    }
})();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    const randomMs = Math.floor(Math.random() * (5080 - 200 + 1)) + 200; // Random height between 600 and 1080
    console.log("waiting for ", randomMs, "ms");
    return delay(randomMs);
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}   