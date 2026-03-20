const axios = require('axios');

const LOGO_API_URL = 'https://api.logo.dev/logos';
const LOGO_API_KEY = process.env.LOGODEV_API_KEY;

/**
 * Fetch company logo using Logo.dev API
 * Fallback to null if not found
 */
async function getCompanyLogo(companyDomain) {
  if (!companyDomain) {
    return null;
  }

  try {
    // Clean domain (remove www, protocol, etc)
    let domain = companyDomain.toLowerCase().trim();
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      domain = new URL(domain).hostname;
    }
    domain = domain.replace('www.', '');

    const response = await axios.get(`${LOGO_API_URL}/${domain}`, {
      params: { apikey: LOGO_API_KEY },
      timeout: 5000,
    });

    if (response.data && response.data.logo) {
      console.log(`✅ Logo found for ${domain}`);
      return response.data.logo;
    }
    
    return null;
  } catch (error) {
    // Logo not found is not a critical error
    console.log(`⚠️  Logo not found for ${companyDomain}`);
    return null;
  }
}

/**
 * Get favicon as fallback
 */
function getFaviconUrl(companyDomain) {
  if (!companyDomain) return null;
  
  let domain = companyDomain.toLowerCase().trim();
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    domain = new URL(domain).hostname;
  }
  
  return `https://${domain}/favicon.ico`;
}

module.exports = { 
  getCompanyLogo,
  getFaviconUrl 
};
