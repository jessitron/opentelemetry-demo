const puppeteer = require('puppeteer');

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


        while (true) {
            console.log("Let's pick a product")
            // Wait for the page to load
            await page.waitForSelector('[data-cy=product-card]'); // Wait for the product cards to appear
            // const products = await page.$('[data-cy=product-card]');
            // const productsCount = products?.length;
            // console.log('productsCount:', productsCount);
            // // if (productsCount > 0) {
            // //     break;
            // // }
            await randomDelay(); // Wait a bit
            // Click on the item's picture
            await page.click('[data-cy=product-card]');

            // Wait for the item's page to load
            //   await page.waitForNavigation();
            //console.log("we have awaited the nagivation to the product page")
            await randomDelay(); // Wait a bit
            // Change the quantity dropdown
            console.log("Let's buy two!!")
            await page.waitForSelector('[data-cy=product-quantity]'); // Wait for the quantity dropdown to appear
            await page.select('[data-cy=product-quantity]', '2'); // Change the quantity to 2

            await randomDelay(); // W
            // Add to cart
            console.log("Let's add to cart")
            await page.waitForSelector('[data-cy=product-add-to-cart]'); // Wait for the add to cart button to appear
            await page.click('[data-cy=product-add-to-cart]');

            console.log("does the cart load?")
            await page.waitForNavigation();
            await randomDelay(); // W
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