const f = fetch;

async function verify() {
  console.log("Verifying backend APIs...\n");

  const endpoints = [
    { name: 'Categories', url: 'http://localhost:4000/api/v1/categories' },
    { name: 'Brands', url: 'http://localhost:4000/api/v1/brands' },
    { name: 'Products', url: 'http://localhost:4000/api/v1/products' },
    { name: 'CMS Banners', url: 'http://localhost:4000/api/v1/cms/banners' } // Verify CMS
  ];

  for (const ep of endpoints) {
    try {
      const res = await f(ep.url);
      const data = await res.json();
      console.log(`[${ep.name}] Status: ${res.status}`);
      if (data.success && Array.isArray(data.data)) {
        console.log(`[${ep.name}] Found ${data.data.length} records.`);
      } else {
        console.log(`[${ep.name}] Response format error or empty data.`, data);
      }
    } catch (e) {
      console.error(`[${ep.name}] Error: ${e.message}`);
    }
  }

  // Get a specific product slug to test detail endpoint
  try {
    const productsRes = await f('http://localhost:4000/api/v1/products');
    const productsData = await productsRes.json();
    if (productsData.success && productsData.data.length > 0) {
      const id = productsData.data[0].id;
      const detailRes = await f(`http://localhost:4000/api/v1/products/${id}`);
      const detailData = await detailRes.json();
      console.log(`\n[Product Detail (${id})] Status: ${detailRes.status}`);
      if (detailData.success && detailData.data) {
        console.log(`[Product Detail] Retrieved ${detailData.data.title} successfully.`);
      } else {
        console.log(`[Product Detail] Failed to retrieve data.`, detailData);
      }
    }
  } catch (e) {
    console.error(`[Product Detail] Error: ${e.message}`);
  }

  console.log("\nBackend verification complete.");
}

verify();
