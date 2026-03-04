import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "app_name": "QR BRAND'S",
            "Login": "Login",
            "Register": "Register / Sign Up",
            "Welcome Back": "Welcome Back",
            "Create Account": "Create Account",
            "I am a": "I am a",
            "customer": "Customer (Buyer)",
            "supplier": "Supplier (Seller)",
            "expert": "Expert",
            "Full Name": "Full Name",
            "Your full name": "Your full name",
            "Email": "Email Address",
            "Phone": "Phone Number",
            "Password": "Password",
            "Enter your password": "Enter your password",
            "Create a password": "Create a password",
            "Remember me": "Remember me",
            "Forgot password?": "Forgot password?",
            "Processing...": "Processing...",
            "Sign In": "Sign In",
            "Or Continue With": "Or Continue With",
            "Sign in with Google": "Sign in with Google",
            "Sign up with Google": "Sign up with Google",
            "Back to Home": "Back to Home",
            "Terms of Service": "Terms of Service",
            "Privacy Policy": "Privacy Policy",
            "By continuing, you agree to our": "By continuing, you agree to our",
            "Home": "Home",
            "Rice Listings": "Rice Listings",
            "Compare": "Compare",
            "Knowledge Hub": "Knowledge Hub",
            "Supplier Panel": "Supplier Panel",
            "My Dashboard": "My Dashboard",
            "Admin Panel": "Admin Panel",
            "Logout": "Logout",
            "Clear": "Clear",
            "Selected": "Selected",
            "Analysis": "Analysis"
        }
    },
    te: {
        translation: {
            "app_name": "QR BRAND'S",
            "Login": "లాగిన్ (Login)",
            "Register": "నమోదు (Register/Signup)",
            "Welcome Back": "మళ్ళీ స్వాగతం",
            "Create Account": "కొత్త ఖాతా సృష్టించండి",
            "I am a": "నేను ఒక",
            "customer": "కొనుగోలుదారు (Buyer)",
            "supplier": "సరఫరాదారు / రైతు (Seller)",
            "expert": "నిపుణుడు (Expert)",
            "Full Name": "పూర్తి పేరు",
            "Your full name": "మీ పూర్తి పేరు నమోదు చేయండి",
            "Email": "ఇమెయిల్ (Email)",
            "Phone": "ఫోన్ నంబర్",
            "Password": "పాస్‌వర్డ్ (Password)",
            "Enter your password": "మీ పాస్‌వర్డ్ నమోదు చేయండి",
            "Create a password": "కొత్త పాస్‌వర్డ్ సృష్టించండి",
            "Remember me": "నన్ను గుర్తుంచుకో",
            "Forgot password?": "పాస్‌వర్డ్ మర్చిపోయారా?",
            "Processing...": "ప్రాసెస్ చేయబడుతోంది...",
            "Sign In": "లాగిన్ అవ్వండి",
            "Or Continue With": "లేదా దీని ద్వారా కొనసాగండి",
            "Sign in with Google": "గూగుల్‌తో లాగిన్ అవ్వండి",
            "Sign up with Google": "గూగుల్‌తో ఖాతా తెరవండి",
            "Back to Home": "హోమ్‌కి తిరిగి వెళ్ళు",
            "Terms of Service": "సేవా నిబంధనలు",
            "Privacy Policy": "గోప్యతా విధానం",
            "By continuing, you agree to our": "కొనసాగించడం ద్వారా మీరు అంగీకరిస్తున్నారు, మా",
            "Home": "హోమ్",
            "Rice Listings": "బియ్యం జాబితాలు",
            "Compare": "పోల్చండి",
            "Knowledge Hub": "విజ్ఞాన కేంద్రం",
            "Supplier Panel": "సరఫరాదారు ప్యానెల్",
            "My Dashboard": "నా డాష్‌బోర్డ్",
            "Admin Panel": "అడ్మిన్ ప్యానెల్",
            "Logout": "లాగ్ అవుట్",
            "Clear": "క్లియర్",
            "Selected": "ఎంచుకోబడింది",
            "Analysis": "విశ్లేషణ"
        }
    },
    hi: {
        translation: {
            "app_name": "QR BRAND'S",
            "Login": "लॉग इन (Login)",
            "Register": "पंजीकरण (Register/Signup)",
            "Welcome Back": "वापसी पर स्वागत है",
            "Create Account": "नया खाता बनाएँ",
            "I am a": "मैं एक हूँ",
            "customer": "ग्राहक / खरीदार",
            "supplier": "आपूर्तिकर्ता / किसान",
            "expert": "विशेषज्ञ",
            "Full Name": "पूरा नाम",
            "Your full name": "अपना पूरा नाम दर्ज करें",
            "Email": "ईमेल (Email)",
            "Phone": "फ़ोन नंबर",
            "Password": "पासवर्ड (Password)",
            "Enter your password": "अपना पासवर्ड दर्ज करें",
            "Create a password": "नया पासवर्ड बनाएँ",
            "Remember me": "मुझे याद रखें",
            "Forgot password?": "पासवर्ड भूल गए?",
            "Processing...": "प्रसंस्करण...",
            "Sign In": "लॉग इन करें",
            "Or Continue With": "या इसके साथ जारी रखें",
            "Sign in with Google": "Google के साथ लॉग इन करें",
            "Sign up with Google": "Google के साथ नया खाता बनाएँ",
            "Back to Home": "होम पर वापस जाएँ",
            "Terms of Service": "सेवा की शर्तें",
            "Privacy Policy": "गोपनीयता नीति",
            "By continuing, you agree to our": "जारी रखकर, आप सहमत हैं हमारे",
            "Home": "होम",
            "Rice Listings": "चावल सूची",
            "Compare": "तुलना करें",
            "Knowledge Hub": "ज्ञान केंद्र",
            "Supplier Panel": "आपूर्तिकर्ता पैनल",
            "My Dashboard": "मेरा डैशबोर्ड",
            "Admin Panel": "एडमिन पैनल",
            "Logout": "लॉग आउट",
            "Clear": "साफ़ करें",
            "Selected": "चयनित",
            "Analysis": "विश्लेषण"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
