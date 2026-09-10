/* ============================================================
   MHD HOSPITAL — I18N MODULE (10 languages)
   Split from app.js. Loaded BEFORE app.js and patient.js.
   Exposes globals: LANGS, I18N, CUR_LANG, t(), applyStaticI18N(),
   fillLangSelects(), setLanguage()
   ============================================================ */
const LANGS = [['en','English'],['hi','हिन्दी'],['ta','தமிழ்'],['te','తెలుగు'],['ml','മലയാളം'],['kn','ಕನ್ನಡ'],['bn','বাংলা'],['mr','मराठी'],['gu','ગુજરાતી'],['pa','ਪੰਜਾਬੀ']];
const I18N = {
 en:{dashboard:'Dashboard',upcoming:'Upcoming',mycase:'My Case',meds:'Medicines',results:'My Results',appts:'Appointments',doctors:'My Doctors',timeline:'Timeline',tracking:'Health Overview',qr:'My QR',privacy:'Privacy & Access',billing:'Billing',notifs:'Notifications',settings:'Settings',emergency:'Emergency',logout:'Logout',cases:'Cases',verify:'Verify Medicines',chats:'Messages',patients:'Patients',dappts:'My Appointments',earnings:'My Earnings',healthinput:'Health Input',hdash:'Hospital Dashboard',hpatients:'All Patients',hdoctors:'All Doctors',hcases:'All Cases',hmeds:'Medicines',hdocs:'Verify Documents',happts:'Appointments',hupload:'Upload Result',greetM:'Good Morning',greetA:'Good Afternoon',greetE:'Good Evening',page:'MHD Hospital',loginH:'Welcome Back',loginSub:'Login to continue to your health portal',email:'Email',password:'Password',remember:'Remember me',forgot:'Forgot password?',loginBtn:'Login',haveAcc:'Already have an account?',createAcc:'Create Health ID',demoBtn:'Quick Demo Login',
  register:'Register',welcomeBack:'Welcome back! Please login to continue.',createAccSub:'Create your MHD account to continue.',noAcc:"Don't have an account?",fullName:'Full Name',dob:'Date of Birth',gender:'Gender',bloodGroup:'Blood Group',phone:'Phone',address:'Address',languageLbl:'Language',rolePatient:'Patient',roleDoctor:'Doctor',roleHospital:'Hospital Admin',registerDoctor:'Register as Doctor',registerHospital:'Register Hospital',
  quickActions:'Quick Actions',bookAppt:'Book Appointment',talkDoctor:'Talk to Doctor',newCase:'New / My Case',todaySchedule:"Today's Schedule",activeMeds:'Active Medicines',recentResults:'Recent Results',recovery:'Recovery Progress',upcomingAppt:'Upcoming Appointment',viewDetails:'View Details',allMeds:'All Medicines',allResults:'All Results',billingHistory:'Billing History',careStatus:'Care Status',noUpcomingAppts:'No upcoming appointments.',noBillsYet:'No bills yet.',upcomingEvents:'Upcoming Events',followReminders:'Follow-up Reminders',addMedicine:'Add Medicine',confirmAppt:'Confirm Appointment',upcomingTab:'Upcoming',completedTab:'Completed',cancelledTab:'Cancelled',notifCenter:'Notification Center',profileSettings:'Profile & Settings',emergencyBtn:'EMERGENCY',saveBtn:'Save',closeBtn:'Close',payBtn:'Pay',pendingLbl:'Pending',paidLbl:'Paid',allBills:'All Bills',verifyCenter:'Medicine Verification Center',loginAs:'Login as',hospitalWord:'Hospital',patientDemo:'Patient Demo',doctorDemo:'Doctor Demo',hospitalDemo:'Hospital Demo',roleLbl:'Role',emailAddress:'Email address',emailPh:'Enter your email address',passPh:'Enter your password',signIn:'Sign in',createAccount:'Create an account',demoAccounts:'→ Demo accounts',demoHint:'Quick demo accounts — created automatically on first use. Password: demo123',demoFill:'Try Demo (fill sample data)',healthStatus:'HEALTH STATUS',nextApptLbl:'NEXT APPOINTMENT',viewLink:'View →',viewAll:'VIEW ALL →',todaysMeds:"TODAY'S MEDICATIONS",waitingReview:'Waiting for Doctor Review',recoStart:'Submit your first case to start tracking your recovery.',recoGreat:'You are doing great! Continue following your care plan.',recoDoing:'You are doing well. Continue following your current care plan.',activeSub:'Active',upcomingSub:'Upcoming',totalSub:'Total',unreadSub:'Unread',takenLbl:'Taken',verifiedLbl:'Verified',markTaken:'Mark Taken',followDue:'Follow-up due'},
 hi:{dashboard:'डैशबोर्ड',upcoming:'आगामी',mycase:'मेरा केस',meds:'दवाइयाँ',results:'मेरे परिणाम',appts:'अपॉइंटमेंट',doctors:'मेरे डॉक्टर',timeline:'टाइमलाइन',tracking:'स्वास्थ्य विवरण',qr:'मेरा QR',privacy:'गोपनीयता व पहुँच',billing:'बिल',notifs:'सूचनाएँ',settings:'सेटिंग्स',emergency:'आपातकाल',logout:'लॉगआउट',cases:'केस',verify:'दवा सत्यापन',chats:'संदेश',patients:'मरीज़',dappts:'मेरे अपॉइंटमेंट',earnings:'मेरी कमाई',healthinput:'स्वास्थ्य प्रविष्टि',hdash:'अस्पताल डैशबोर्ड',hpatients:'सभी मरीज़',hdoctors:'सभी डॉक्टर',hcases:'सभी केस',hmeds:'दवाइयाँ',hdocs:'दस्तावेज़ सत्यापन',happts:'अपॉइंटमेंट',hupload:'परिणाम अपलोड',greetM:'सुप्रभात',greetA:'नमस्कार',greetE:'शुभ संध्या',page:'MHD हॉस्पिटल',loginH:'वापसी पर स्वागत है',loginSub:'अपने हेल्थ पोर्टल पर जारी रखने के लिए लॉगिन करें',email:'ईमेल',password:'पासवर्ड',remember:'मुझे याद रखें',forgot:'पासवर्ड भूल गए?',loginBtn:'लॉगिन',haveAcc:'पहले से खाता है?',createAcc:'हेल्थ आईडी बनाएं',demoBtn:'क्विक डेमो लॉगिन',
  register:'रजिस्टर',welcomeBack:'वापसी पर स्वागत है! जारी रखने के लिए लॉगिन करें।',createAccSub:'जारी रखने के लिए अपना MHD खाता बनाएं।',noAcc:'खाता नहीं है?',fullName:'पूरा नाम',dob:'जन्म तिथि',gender:'लिंग',bloodGroup:'रक्त समूह',phone:'फ़ोन',address:'पता',languageLbl:'भाषा',rolePatient:'मरीज़',roleDoctor:'डॉक्टर',roleHospital:'अस्पताल प्रशासक',registerDoctor:'डॉक्टर के रूप में रजिस्टर करें',registerHospital:'अस्पताल रजिस्टर करें',
  quickActions:'त्वरित कार्य',bookAppt:'अपॉइंटमेंट बुक करें',talkDoctor:'डॉक्टर से बात करें',newCase:'नया / मेरा केस',todaySchedule:'आज का शेड्यूल',activeMeds:'सक्रिय दवाइयाँ',recentResults:'हाल के परिणाम',recovery:'रिकवरी प्रगति',upcomingAppt:'आगामी अपॉइंटमेंट',viewDetails:'विवरण देखें',allMeds:'सभी दवाइयाँ',allResults:'सभी परिणाम',billingHistory:'बिल इतिहास',careStatus:'देखभाल स्थिति',noUpcomingAppts:'कोई आगामी अपॉइंटमेंट नहीं।',noBillsYet:'अभी कोई बिल नहीं है।',upcomingEvents:'आगामी कार्यक्रम',followReminders:'फॉलो-अप अनुस्मारक',addMedicine:'दवा जोड़ें',confirmAppt:'अपॉइंटमेंट की पुष्टि करें',upcomingTab:'आगामी',completedTab:'पूर्ण',cancelledTab:'रद्द',notifCenter:'सूचना केंद्र',profileSettings:'प्रोफ़ाइल व सेटिंग्स',emergencyBtn:'आपातकाल',saveBtn:'सहेजें',closeBtn:'बंद करें',payBtn:'भुगतान करें',pendingLbl:'बाकी',paidLbl:'भुगतान हुआ',allBills:'सभी बिल',verifyCenter:'दवा सत्यापन केंद्र',loginAs:'लॉगिन के रूप में',hospitalWord:'अस्पताल',patientDemo:'मरीज़ डेमो',doctorDemo:'डॉक्टर डेमो',hospitalDemo:'अस्पताल डेमो',roleLbl:'भूमिका',emailAddress:'ईमेल पता',emailPh:'अपना ईमेल पता दर्ज करें',passPh:'अपना पासवर्ड दर्ज करें',signIn:'साइन इन करें',createAccount:'खाता बनाएं',demoAccounts:'→ डेमो खाते',demoHint:'क्विक डेमो खाते — पहली बार उपयोग पर स्वतः बन जाते हैं। पासवर्ड: demo123',demoFill:'डेमो आज़माएं (नमूना डेटा भरें)',healthStatus:'स्वास्थ्य स्थिति',nextApptLbl:'अगला अपॉइंटमेंट',viewLink:'देखें →',viewAll:'सभी देखें →',todaysMeds:'आज की दवाइयाँ',waitingReview:'डॉक्टर समीक्षा के लिए प्रतीक्षा',recoStart:'रिकवरी ट्रैक करना शुरू करने के लिए अपना पहला केस सबमिट करें।',recoGreat:'आप बहुत अच्छा कर रहे हैं! अपनी देखभाल योजना जारी रखें।',recoDoing:'आप अच्छा कर रहे हैं। अपनी वर्तमान देखभाल योजना जारी रखें।',activeSub:'सक्रिय',upcomingSub:'आगामी',totalSub:'कुल',unreadSub:'अपठित',takenLbl:'ली गई',verifiedLbl:'सत्यापित',markTaken:'ली गई चिह्नित करें',followDue:'फॉलो-अप बाकी'},
 ta:{dashboard:'டாஷ்போர்டு',upcoming:'வரவிருக்கும்',mycase:'என் கேஸ்',meds:'மருந்துகள்',results:'என் முடிவுகள்',appts:'சந்திப்புகள்',doctors:'என் மருத்துவர்கள்',timeline:'காலவரிசை',tracking:'உடல்நல கண்ணோட்டம்',qr:'என் QR',privacy:'தனியுரிமை & அணுகல்',billing:'பில்',notifs:'அறிவிப்புகள்',settings:'அமைப்புகள்',emergency:'அவசரம்',logout:'வெளியேறு',cases:'கேஸ்கள்',verify:'மருந்து சரிபார்ப்பு',chats:'செய்திகள்',patients:'நோயாளிகள்',dappts:'என் சந்திப்புகள்',earnings:'என் வருவாய்',healthinput:'உடல்நல பதிவு',hdash:'மருத்துவமனை டாஷ்போர்டு',hpatients:'அனைத்து நோயாளிகள்',hdoctors:'அனைத்து மருத்துவர்கள்',hcases:'அனைத்து கேஸ்கள்',hmeds:'மருந்துகள்',hdocs:'ஆவண சரிபார்ப்பு',happts:'சந்திப்புகள்',hupload:'முடிவு பதிவேற்றம்',greetM:'காலை வணக்கம்',greetA:'மதிய வணக்கம்',greetE:'மாலை வணக்கம்',page:'MHD மருத்துவமனை',loginH:'மீண்டும் வரவேற்கிறோம்',loginSub:'உங்கள் சுகாதார தளத்திற்கு உள்நுழையவும்',email:'மின்னஞ்சல்',password:'கடவுச்சொல்',remember:'என்னை நினைவில் கொள்',forgot:'கடவுச்சொல்லை மறந்தீர்களா?',loginBtn:'உள்நுழைய',haveAcc:'ஏற்கனவே கணக்கு உள்ளதா?',createAcc:'உடல்நல ஐடி உருவாக்கு',demoBtn:'டெமா உள்நுழைவு',
  register:'பதிவு செய்யுங்கள்',welcomeBack:'மீண்டும் வருக! தொடர உள்நுழையுங்கள்.',createAccSub:'தொடர உங்கள் MHD கணக்கை உருவாக்குங்கள்.',noAcc:'கணக்கு இல்லையா?',fullName:'முழு பெயர்',dob:'பிறந்த தேதி',gender:'பாலினம்',bloodGroup:'ரத்த வகை',phone:'தொலைபேசி',address:'முகவரி',languageLbl:'மொழி',rolePatient:'நோயாளி',roleDoctor:'மருத்துவர்',roleHospital:'மருத்துவமனை நிர்வாகி',registerDoctor:'மருத்துவராக பதிவு',registerHospital:'மருத்துவமனையை பதிவு செய்யுங்கள்',
  quickActions:'விரைவு செயல்கள்',bookAppt:'சந்திப்பு பதிவு செய்யுங்கள்',talkDoctor:'மருத்துவருடன் பேசுங்கள்',newCase:'புதிய / என் கேஸ்',todaySchedule:'இன்றைய அட்டவணை',activeMeds:'செயலில் உள்ள மருந்துகள்',recentResults:'சமீபத்திய முடிவுகள்',recovery:'மீட்சி முன்னேற்றம்',upcomingAppt:'வரவிருக்கும் சந்திப்பு',viewDetails:'விவரங்களைப் பார்க்க',allMeds:'அனைத்து மருந்துகள்',allResults:'அனைத்து முடிவுகள்',billingHistory:'பில் வரலாறு',careStatus:'பராமரிப்பு நிலை',noUpcomingAppts:'வரவிருக்கும் சந்திப்புகள் இல்லை.',noBillsYet:'இன்னும் பில்கள் இல்லை.',upcomingEvents:'வரவிருக்கும் நிகழ்வுகள்',followReminders:'பின்தொடர்வு நினைவூட்டல்கள்',addMedicine:'மருந்து சேர்க்கவும்',confirmAppt:'சந்திப்பை உறுதிப்படுத்து',upcomingTab:'வரவிருக்கும்',completedTab:'முடிந்தது',cancelledTab:'ரத்து',notifCenter:'அறிவிப்பு மையம்',profileSettings:'சுயவிவரம் & அமைப்புகள்',emergencyBtn:'அவசரம்',saveBtn:'சேமி',closeBtn:'மூடு',payBtn:'பணம் செலுத்து',pendingLbl:'நிலுவையில்',paidLbl:'பணம் செலுத்தப்பட்டது',allBills:'அனைத்து பில்கள்',verifyCenter:'மருந்து சரிபார்ப்பு மையம்',loginAs:'உள்நுழையும் பாத்திரம்',hospitalWord:'மருத்துவமனை',patientDemo:'நோயாளி டெமோ',doctorDemo:'மருத்துவர் டெமோ',hospitalDemo:'மருத்துவமனை டெமோ',roleLbl:'பாத்திரம்',emailAddress:'மின்னஞ்சல் முகவரி',emailPh:'உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்',passPh:'உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்',signIn:'உள்நுழைய',createAccount:'கணக்கை உருவாக்கு',demoAccounts:'→ டெமோ கணக்குகள்',demoHint:'டெமோ கணக்குகள் — முதல் பயன்பாட்டில் தானாக உருவாகும். கடவுச்சொல்: demo123',demoFill:'டெமோ முயற்சி (மாதிரி தரவு)',healthStatus:'உடல்நல நிலை',nextApptLbl:'அடுத்த சந்திப்பு',viewLink:'பார்க்க →',viewAll:'அனைத்தையும் பார்க்க →',todaysMeds:'இன்றைய மருந்துகள்',waitingReview:'மருத்துவர் மதிப்பாய்வுக்காக காத்திருக்கிறது',recoStart:'மீட்சியைக் கண்காணிக்க உங்கள் முதல் கேஸை சமர்ப்பிக்கவும்.',recoGreat:'நீங்கள் சிறப்பாக இருக்கிறீர்கள்! கவனிப்புத் திட்டத்தை தொடர்ந்து பின்பற்றுங்கள்.',recoDoing:'நீங்கள் நன்றாக இருக்கிறீர்கள். தற்போதைய கவனிப்புத் திட்டத்தை தொடர்ந்து பின்பற்றுங்கள்.',activeSub:'செயலில்',upcomingSub:'வரவிருக்கும்',totalSub:'மொத்தம்',unreadSub:'படிக்காதது',takenLbl:'எடுக்கப்பட்டது',verifiedLbl:'சரிபார்க்கப்பட்டது',markTaken:'எடுத்ததாக குறி',followDue:'பின்தொடர்வு நிலுவை'},
 te:{dashboard:'డాష్‌బోర్డ్',upcoming:'రాబోయేవి',mycase:'నా కేసు',meds:'మందులు',results:'నా ఫలితాలు',appts:'అపాయింట్‌మెంట్లు',doctors:'నా డాక్టర్లు',timeline:'టైమ్‌లైన్',tracking:'ఆరోగ్య సమాచారం',qr:'నా QR',privacy:'గోప్యత & యాక్సెస్',billing:'బిల్లు',notifs:'నోటిఫికేషన్లు',settings:'సెట్టింగ్‌లు',emergency:'అత్యవసరం',logout:'లాగ్ అవుట్',cases:'కేసులు',verify:'మందు ధృవీకరణ',chats:'సందేశాలు',patients:'రోగులు',dappts:'నా అపాయింట్‌మెంట్లు',earnings:'నా ఆదాయం',healthinput:'ఆరోగ్య నమోదు',hdash:'ఆసుపత్రి డాష్‌బోర్డ్',hpatients:'అన్ని రోగులు',hdoctors:'అన్ని డాక్టర్లు',hcases:'అన్ని కేసులు',hmeds:'మందులు',hdocs:'పత్ర ధృవీకరణ',happts:'అపాయింట్‌మెంట్లు',hupload:'ఫలితం అప్‌లోడ్',greetM:'శుభోదయం',greetA:'శుభ మధ్యాహ్నం',greetE:'శుభ సాయంత్రం',page:'MHD ఆసుపత్రి',loginH:'తిరిగి స్వాగతం',loginSub:'మీ ఆరోగ్య పోర్టల్‌కు కొనసాగించడానికి లాగిన్ అవ్వండి',email:'ఇమెయిల్',password:'పాస్‌వర్డ్',remember:'నన్ను గుర్తుంచుకో',forgot:'పాస్‌వర్డ్ మరచిపోయారా?',loginBtn:'లాగిన్',haveAcc:'ఖాతా ఉందా?',createAcc:'హెల్త్ ఐడీ సృష్టించండి',demoBtn:'డెమో లాగిన్',
  register:'నమోదు చేసుకోండి',welcomeBack:'తిరిగి వచ్చారు! కొనసాగించడానికి లాగిన్ అవ్వండి.',createAccSub:'కొనసాగించడానికి మీ MHD ఖాతాను సృష్టించండి.',noAcc:'ఖాతా లేదా?',fullName:'పూర్తి పేరు',dob:'పుట్టిన తేదీ',gender:'లింగం',bloodGroup:'రక్త వర్గం',phone:'ఫోన్',address:'చిరునామా',languageLbl:'భాష',rolePatient:'రోగి',roleDoctor:'వైద్యుడు',roleHospital:'ఆసుపత్రి నిర్వాహకుడు',registerDoctor:'వైద్యుడిగా నమోదు',registerHospital:'ఆసుపత్రిని నమోదు చేయండి',
  quickActions:'త్వరిత చర్యలు',bookAppt:'అపాయింట్‌మెంట్ బుక్ చేయండి',talkDoctor:'డాక్టర్‌తో మాట్లాడండి',newCase:'కొత్త / నా కేసు',todaySchedule:'ఈరోజు షెడ్యూల్',activeMeds:'క్రియాశీల మందులు',recentResults:'ఇటీవలి ఫలితాలు',recovery:'కోలుకోవడం పురోగతి',upcomingAppt:'రాబోయే అపాయింట్‌మెంట్',viewDetails:'వివరాలు చూడండి',allMeds:'అన్ని మందులు',allResults:'అన్ని ఫలితాలు',billingHistory:'బిల్లుల చరిత్ర',careStatus:'సంరక్షణ స్థితి',noUpcomingAppts:'రాబోయే అపాయింట్‌మెంట్లు లేవు.',noBillsYet:'ఇంకా బిల్లులు లేవు.',upcomingEvents:'రాబోయే కార్యక్రమాలు',followReminders:'ఫాలో-అప్ రిమైండర్లు',addMedicine:'మందు జోడించండి',confirmAppt:'అపాయింట్‌మెంట్ ఖరారు చేయండి',upcomingTab:'రాబోయేవి',completedTab:'పూర్తయినవి',cancelledTab:'రద్దు',notifCenter:'నోటిఫికేషన్ కేంద్రం',profileSettings:'ప్రొఫైల్ & సెట్టింగ్‌లు',emergencyBtn:'అత్యవసరం',saveBtn:'సేవ్ చేయండి',closeBtn:'మూసివేయండి',payBtn:'చెల్లించండి',pendingLbl:'పెండింగ్',paidLbl:'చెల్లించారు',allBills:'అన్ని బిల్లులు',verifyCenter:'మందు ధృవీకరణ కేంద్రం',loginAs:'లాగిన్ రోల్',hospitalWord:'ఆసుపత్రి',patientDemo:'రోగి డెమో',doctorDemo:'వైద్యుడు డెమో',hospitalDemo:'ఆసుపత్రి డెమో',roleLbl:'పాత్ర',emailAddress:'ఇమెయిల్ చిరునామా',emailPh:'మీ ఇమెయిల్ నమోదు చేయండి',passPh:'మీ పాస్‌వర్డ్ నమోదు చేయండి',signIn:'లాగిన్',createAccount:'ఖాతా సృష్టించండి',demoAccounts:'→ డెమో ఖాతాలు',demoHint:'డెమో ఖాతాలు — మొదటి వాడకంలో స్వయంగా సృష్టమవుతాయి. పాస్‌వర్డ్: demo123',demoFill:'డెమో ప్రయత్నించండి (నమూనా డేటా)',healthStatus:'ఆరోగ్య స్థితి',nextApptLbl:'తదుపరి అపాయింట్‌మెంట్',viewLink:'చూడండి →',viewAll:'అన్నీ చూడండి →',todaysMeds:'ఈరోజు మందులు',waitingReview:'వైద్యుడి సమీక్ష కోసం వేచి ఉన్నారు',recoStart:'కోలుకోవడం ట్రాక్ చేయడానికి మీ మొదటి కేసు సమర్పించండి.',recoGreat:'మీరు చాలా బాగుంటున్నారు! సంరక్షణ ప్రణాళికను కొనసాగించండి.',recoDoing:'మీరు బాగుంటున్నారు. ప్రస్తుత సంరక్షణ ప్రణాళికను కొనసాగించండి.',activeSub:'క్రియాశీల',upcomingSub:'రాబోతున్న',totalSub:'మొత్తం',unreadSub:'చదవని',takenLbl:'తీసుకున్నారు',verifiedLbl:'ధృవీకరించబడింది',markTaken:'తీసుకున్నట్టు గుర్తించు',followDue:'ఫాలో-అప్ మిగిలింది'},
 ml:{dashboard:'ഡാഷ്ബോർഡ്',upcoming:'വരാനിരിക്കുന്നവ',mycase:'എന്റെ കേസ്',meds:'മരുന്നുകൾ',results:'എന്റെ ഫലങ്ങൾ',appts:'അപ്പോയിന്റ്മെന്റുകൾ',doctors:'എന്റെ ഡോക്ടർമാർ',timeline:'ടൈംലൈൻ',tracking:'ആരോഗ്യ അവലോകനം',qr:'എന്റെ QR',privacy:'സ്വകാര്യത & ആക്സസ്സ്',billing:'ബിൽ',notifs:'അറിയിപ്പുകൾ',settings:'സെറ്റിംഗ്സ്',emergency:'അത്യാഹിതം',logout:'ലോഗ് ഔട്ട്',cases:'കേസുകൾ',verify:'മരുന്ന് സ്ഥിരീകരണം',chats:'സന്ദേശങ്ങൾ',patients:'രോഗികൾ',dappts:'എന്റെ അപ്പോയിന്റ്മെന്റുകൾ',earnings:'എന്റെ വരുമാനം',healthinput:'ആരോഗ്യ നമോദു',hdash:'ആശുപത്രി ഡാഷ്ബോർഡ്',hpatients:'എല്ലാ രോഗികളും',hdoctors:'എല്ലാ ഡോക്ടർമാരും',hcases:'എല്ലാ കേസുകളും',hmeds:'മരുന്നുകൾ',hdocs:'രേഖ സ്ഥിരീകരണം',happts:'അപ്പോയിന്റ്മെന്റുകൾ',hupload:'ഫലം അപ്‌ലോഡ്',greetM:'സുപ്രഭാതം',greetA:'ശുഭ ഉച്ച',greetE:'ശുഭ സന്ധ്യ',page:'MHD ആശുപത്രി',loginH:'വീണ്ടും സ്വാഗതം',loginSub:'നിങ്ങളുടെ ആരോഗ്യ പോർട്ടലിലേക്ക് തുടരാൻ ലോഗിൻ ചെയ്യുക',email:'ഇമെയിൽ',password:'പാസ്‌വേഡ്',remember:'എന്നെ ഓർത്തിരിക്കുക',forgot:'പാസ്‌വേഡ് മറന്നോ?',loginBtn:'ലോഗിൻ',haveAcc:'അക്കൗണ്ട് ഉണ്ടോ?',createAcc:'ഹെൽത്ത് ഐഡി സൃഷ്ടിക്കുക',demoBtn:'ഡെമോ ലോഗിൻ',
  register:'രജിസ്റ്റർ ചെയ്യുക',welcomeBack:'വീണ്ടും വന്നതിൽ സന്തോഷം! തുടരാൻ ലോഗിൻ ചെയ്യുക.',createAccSub:'തുടരാൻ നിങ്ങളുടെ MHD അക്കൗണ്ട് സൃഷ്ടിക്കുക.',noAcc:'അക്കൗണ്ട് ഇല്ലേ?',fullName:'പൂർണ്ണ പേര്',dob:'ജനന തീയതി',gender:'ലിംഗം',bloodGroup:'രക്ത ഗ്രൂപ്പ്',phone:'ഫോൺ',address:'വിലാസം',languageLbl:'ഭാഷ',rolePatient:'രോഗി',roleDoctor:'ഡോക്ടർ',roleHospital:'ആശുപത്രി അഡ്മിൻ',registerDoctor:'ഡോക്ടറായി രജിസ്റ്റർ ചെയ്യുക',registerHospital:'ആശുപത്രി രജിസ്റ്റർ ചെയ്യുക',
  quickActions:'ദ്രുത പ്രവർത്തനങ്ങൾ',bookAppt:'അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക',talkDoctor:'ഡോക്ടറുമായി സംസാരിക്കുക',newCase:'പുതിയ / എന്റെ കേസ്',todaySchedule:'ഇന്നത്തെ ഷെഡ്യൂൾ',activeMeds:'സജീവ മരുന്നുകൾ',recentResults:'സമീപകാല ഫലങ്ങൾ',recovery:'വീണ്ടെടുപ്പ് പുരോഗതി',upcomingAppt:'വരാനിരിക്കുന്ന അപ്പോയിന്റ്മെന്റ്',viewDetails:'വിവരങ്ങൾ കാണുക',allMeds:'എല്ലാ മരുന്നുകളും',allResults:'എല്ലാ ഫലങ്ങളും',billingHistory:'ബിൽ ചരിത്രം',careStatus:'പരിചരണ നില',noUpcomingAppts:'വരാനിരിക്കുന്ന അപ്പോയിന്റ്മെന്റുകൾ ഇല്ല.',noBillsYet:'ഇതുവരെ ബില്ലുകൾ ഇല്ല.',upcomingEvents:'വരാനിരിക്കുന്ന പരിപാടികൾ',followReminders:'ഫോളോ-അപ്പ് ഓർമ്മപ്പെടുത്തലുകൾ',addMedicine:'മരുന്ന് ചേർക്കുക',confirmAppt:'അപ്പോയിന്റ്മെന്റ് സ്ഥിരീകരിക്കുക',upcomingTab:'വരാനിരിക്കുന്നവ',completedTab:'പൂർത്തിയായത്',cancelledTab:'റദ്ദാക്കിയത്',notifCenter:'അറിയിപ്പ് കേന്ദ്രം',profileSettings:'പ്രൊഫൈൽ & സെറ്റിംഗ്സ്',emergencyBtn:'അത്യാഹിതം',saveBtn:'സേവ് ചെയ്യുക',closeBtn:'അടയ്ക്കുക',payBtn:'പണമടയ്ക്കുക',pendingLbl:'ബാക്കി',paidLbl:'അടച്ചു',allBills:'എല്ലാ ബില്ലുകളും',verifyCenter:'മരുന്ന് സ്ഥിരീകരണ കേന്ദ്രം',loginAs:'ലോഗിൻ റോൾ',hospitalWord:'ആശുപത്രി',patientDemo:'രോഗി ഡെമോ',doctorDemo:'ഡോക്ടർ ഡെമോ',hospitalDemo:'ആശുപത്രി ഡെമോ',roleLbl:'റോൾ',emailAddress:'ഇമെയിൽ വിലാസം',emailPh:'നിങ്ങളുടെ ഇമെയിൽ നൽകുക',passPh:'നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക',signIn:'ലോഗിൻ',createAccount:'അക്കൗണ്ട് സൃഷ്ടിക്കുക',demoAccounts:'→ ഡെമോ അക്കൗണ്ടുകൾ',demoHint:'ഡെമോ അക്കൗണ്ടുകൾ — ആദ്യ ഉപയോഗത്തിൽ സ്വയമേവ സൃഷ്ടിക്കുന്നു. പാസ്‌വേഡ്: demo123',demoFill:'ഡെമോ പരീക്ഷിക്കുക (സാമ്പിൾ ഡാറ്റ)',healthStatus:'ആരോഗ്യ നില',nextApptLbl:'അടുത്ത അപ്പോയിന്റ്മെന്റ്',viewLink:'കാണുക →',viewAll:'എല്ലാം കാണുക →',todaysMeds:'ഇന്നത്തെ മരുന്നുകൾ',waitingReview:'ഡോക്ടർ അവലോകനത്തിനായി കാക്കുന്നു',recoStart:'വീണ്ടെടുപ്പ് ട്രാക്ക് ചെയ്യാൻ ആദ്യ കേസ് സമർപ്പിക്കുക.',recoGreat:'നിങ്ങൾ വളരെ നന്നായിട്ടുണ്ട്! പരിചരണ പദ്ധതി തുടർന്ന് പാലിക്കുക.',recoDoing:'നിങ്ങൾ നന്നായിരിക്കുന്നു. നിലവിലെ പരിചരണ പദ്ധതി തുടരുക.',activeSub:'സജീവം',upcomingSub:'വരാനുള്ള',totalSub:'ആകെ',unreadSub:'വായിച്ചിട്ടില്ല',takenLbl:'എടുത്തു',verifiedLbl:'സ്ഥിരീകരിച്ചു',markTaken:'എടുത്തതായി അടയാളപ്പെടുത്തുക',followDue:'ഫോളോ-അപ്പ് ബാക്കി'},
 kn:{dashboard:'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',upcoming:'ಮುಂಬರುವ',mycase:'ನನ್ನ ಪ್ರಕರಣ',meds:'ಔಷಧಿಗಳು',results:'ನನ್ನ ಫಲಿತಾಂಶ',appts:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',doctors:'ನನ್ನ ವೈದ್ಯರು',timeline:'ಟೈಮ್‌ಲೈನ್',tracking:'ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ',qr:'ನನ್ನ QR',privacy:'ಗೋಪ್ಯತೆ ಮತ್ತು ಪ್ರವೇಶ',billing:'ಬಿಲ್',notifs:'ಅಧಿಸೂಚನೆಗಳು',settings:'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',emergency:'ತುರ್ತು',logout:'ಲಾಗ್ ಔಟ್',cases:'ಪ್ರಕರಣಗಳು',verify:'ಔಷಧ ಪರಿಶೀಲನೆ',chats:'ಸಂದೇಶಗಳು',patients:'ರೋಗಿಗಳು',dappts:'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',earnings:'ನನ್ನ ಆದಾಯ',healthinput:'ಆರೋಗ್ಯ ನಮೂದು',hdash:'ಆಸ್ಪತ್ರೆ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',hpatients:'ಎಲ್ಲಾ ರೋಗಿಗಳು',hdoctors:'ಎಲ್ಲಾ ವೈದ್ಯರು',hcases:'ಎಲ್ಲಾ ಪ್ರಕರಣಗಳು',hmeds:'ಔಷಧಿಗಳು',hdocs:'ದಸ್ತಾವೇಜು ಪರಿಶೀಲನೆ',happts:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',hupload:'ಫಲಿತಾಂಶ ಅಪ್‌ಲೋಡ್',greetM:'ಶುಭೋದಯ',greetA:'ಶುಭ ಮಧ್ಯಾಹ್ನ',greetE:'ಶುಭ ಸಂಜೆ',page:'MHD ಆಸ್ಪತ್ರೆ',loginH:'ಮರಳಿ ಸ್ವಾಗತ',loginSub:'ನಿಮ್ಮ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್‌ಗೆ ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ',email:'ಇಮೇಲ್',password:'ಪಾಸ್‌ವರ್ಡ್',remember:'ನನ್ನನ್ನು ನೆನಪಿಟ್ಟುಕೊಳ್ಳಿ',forgot:'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',loginBtn:'ಲಾಗಿನ್',haveAcc:'ಖಾತೆ ಇದೆಯೇ?',createAcc:'ಆರೋಗ್ಯ ಐಡಿ ರಚಿಸಿ',demoBtn:'ಡೆಮೊ ಲಾಗಿನ್',
  register:'ನೋಂದಣಿ ಮಾಡಿ',welcomeBack:'ಮರಳಿ ಬಂದಿದ್ದಕ್ಕೆ ಸ್ವಾಗತ! ಮುಂದುವರಿಯಲು ಲಾಗಿನ್ ಮಾಡಿ.',createAccSub:'ಮುಂದುವರಿಯಲು ನಿಮ್ಮ MHD ಖಾತೆಯನ್ನು ರಚಿಸಿ.',noAcc:'ಖಾತೆ ಇಲ್ಲವೇ?',fullName:'ಪೂರ್ಣ ಹೆಸರು',dob:'ಜನ್ಮ ದಿನಾಂಕ',gender:'ಲಿಂಗ',bloodGroup:'ರಕ್ತ ಗುಂಪು',phone:'ದೂರವಾಣಿ',address:'ವಿಳಾಸ',languageLbl:'ಭಾಷೆ',rolePatient:'ರೋಗಿ',roleDoctor:'ವೈದ್ಯ',roleHospital:'ಆಸ್ಪತ್ರೆ ಆಡಳಿತಗಾರ',registerDoctor:'ವೈದ್ಯರಾಗಿ ನೋಂದಣಿ',registerHospital:'ಆಸ್ಪತ್ರೆ ನೋಂದಣಿ ಮಾಡಿ',
  quickActions:'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',bookAppt:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',talkDoctor:'ವೈದ್ಯರೊಂದಿಗೆ ಮಾತನಾಡಿ',newCase:'ಹೊಸ / ನನ್ನ ಪ್ರಕರಣ',todaySchedule:'ಇಂದಿನ ವೇಳಾಪಟ್ಟಿ',activeMeds:'ಸಕ್ರಿಯ ಔಷಧಿಗಳು',recentResults:'ಇತ್ತೀಚಿನ ಫಲಿತಾಂಶಗಳು',recovery:'ಚೇತರಿಕೆ ಪ್ರಗತಿ',upcomingAppt:'ಮುಂಬರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್',viewDetails:'ವಿವರಗಳನ್ನು ನೋಡಿ',allMeds:'ಎಲ್ಲಾ ಔಷಧಿಗಳು',allResults:'ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳು',billingHistory:'ಬಿಲ್ ಇತಿಹಾಸ',careStatus:'ಆರೈಕೆ ಸ್ಥಿತಿ',noUpcomingAppts:'ಮುಂಬರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳಿಲ್ಲ.',noBillsYet:'ಇನ್ನೂ ಬಿಲ್‌ಗಳಿಲ್ಲ.',upcomingEvents:'ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು',followReminders:'ಫಾಲೋ-ಅಪ್ ಜ್ಞಾಪನೆಗಳು',addMedicine:'ಔಷಧಿ ಸೇರಿಸಿ',confirmAppt:'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದೃಢೀಕರಿಸಿ',upcomingTab:'ಮುಂಬರುವ',completedTab:'ಪೂರ್ಣಗೊಂಡಿದೆ',cancelledTab:'ರದ್ದು',notifCenter:'ಅಧಿಸೂಚನೆ ಕೇಂದ್ರ',profileSettings:'ಪ್ರೊಫೈಲ್ & ಸೆಟ್ಟಿಂಗ್‌ಗಳು',emergencyBtn:'ತುರ್ತು',saveBtn:'ಉಳಿಸಿ',closeBtn:'ಮುಚ್ಚಿ',payBtn:'ಪಾವತಿಸಿ',pendingLbl:'ಬಾಕಿ',paidLbl:'ಪಾವತಿಯಾಗಿದೆ',allBills:'ಎಲ್ಲಾ ಬಿಲ್‌ಗಳು',verifyCenter:'ಔಷಧ ಪರಿಶೀಲನಾ ಕೇಂದ್ರ',loginAs:'ಲಾಗಿನ್ ಪಾತ್ರ',hospitalWord:'ಆಸ್ಪತ್ರೆ',patientDemo:'ರೋಗಿ ಡೆಮೊ',doctorDemo:'ವೈದ್ಯ ಡೆಮೊ',hospitalDemo:'ಆಸ್ಪತ್ರೆ ಡೆಮೊ',roleLbl:'ಪಾತ್ರ',emailAddress:'ಇಮೇಲ್ ವಿಳಾಸ',emailPh:'ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ',passPh:'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',signIn:'ಲಾಗಿನ್',createAccount:'ಖಾತೆ ರಚಿಸಿ',demoAccounts:'→ ಡೆಮೊ ಖಾತೆಗಳು',demoHint:'ಡೆಮೊ ಖಾತೆಗಳು — ಮೊದಲ ಬಳಕೆಯಲ್ಲಿ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ರಚನೆಯಾಗುತ್ತವೆ. ಪಾಸ್‌ವರ್ಡ್: demo123',demoFill:'ಡೆಮೊ ಪ್ರಯತ್ನಿಸಿ (ಮಾದರಿ ದತ್ತಾಂಶ)',healthStatus:'ಆರೋಗ್ಯ ಸ್ಥಿತಿ',nextApptLbl:'ಮುಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್',viewLink:'ನೋಡಿ →',viewAll:'ಎಲ್ಲವನ್ನೂ ನೋಡಿ →',todaysMeds:'ಇಂದಿನ ಔಷಧಿಗಳು',waitingReview:'ವೈದ್ಯರ ಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ',recoStart:'ಚೇತರಿಕೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ನಿಮ್ಮ ಮೊದಲ ಪ್ರಕರಣವನ್ನು ಸಲ್ಲಿಸಿ.',recoGreat:'ನೀವು ಬಹಳ ಚೆನ್ನಾಗಿದ್ದೀರಿ! ಆರೈಕೆ ಯೋಜನೆಯನ್ನು ಮುಂದುವರಿಸಿ.',recoDoing:'ನೀವು ಚೆನ್ನಾಗಿದ್ದೀರಿ. ಪ್ರಸ್ತುತ ಆರೈಕೆ ಯೋಜನೆಯನ್ನು ಮುಂದುವರಿಸಿ.',activeSub:'ಸಕ್ರಿಯ',upcomingSub:'ಮುಂಬರುವ',totalSub:'ಒಟ್ಟು',unreadSub:'ಓದಿಲ್ಲ',takenLbl:'ತೆಗೆದುಕೊಂಡ',verifiedLbl:'ದೃಢೀಕರಿಸಲಾಗಿದೆ',markTaken:'ತೆಗೆದುಕೊಂಡಂತೆ ಗುರ್ತಿಸಿ',followDue:'ಫಾಲೋ-ಅಪ್ ಬಾಕಿ'},
 bn:{dashboard:'ড্যাশবোর্ড',upcoming:'আসন্ন',mycase:'আমার কেস',meds:'ওষুধ',results:'আমার ফলাফল',appts:'অ্যাপয়েন্টমেন্ট',doctors:'আমার ডাক্তার',timeline:'টাইমলাইন',tracking:'স্বাস্থ্য ওভারভিউ',qr:'আমার QR',privacy:'গোপনীয়তা ও অ্যাক্সেস',billing:'বিল',notifs:'বিজ্ঞপ্তি',settings:'সেটিংস',emergency:'জরুরি',logout:'লগআউট',cases:'কেস',verify:'ওষুধ যাচাই',chats:'বার্তা',patients:'রোগী',dappts:'আমার অ্যাপয়েন্টমেন্ট',earnings:'আমার আয়',healthinput:'স্বাস্থ্য এন্ট্রি',hdash:'হাসপাতাল ড্যাশবোর্ড',hpatients:'সব রোগী',hdoctors:'সব ডাক্তার',hcases:'সব কেস',hmeds:'ওষুধ',hdocs:'ডকুমেন্ট যাচাই',happts:'অ্যাপয়েন্টমেন্ট',hupload:'ফলাফল আপলোড',greetM:'সুপ্রভাত',greetA:'শুভ অপরাহ্ন',greetE:'শুভ সন্ধ্যা',page:'MHD হাসপাতাল',loginH:'স্বাগতম',loginSub:'আপনার স্বাস্থ্য পোর্টালে চালিয়ে যেতে লগইন করুন',email:'ইমেইল',password:'পাসওয়ার্ড',remember:'মনে রাখুন',forgot:'পাসওয়ার্ড ভুলে গেছেন?',loginBtn:'লগইন',haveAcc:'অ্যাকাউন্ট আছে?',createAcc:'হেলথ আইডি তৈরি করুন',demoBtn:'ডেমো লগইন',
  register:'রেজিস্টার',welcomeBack:'ফিরে আসার জন্য স্বাগতম! চালিয়ে যেতে লগইন করুন।',createAccSub:'চালিয়ে যেতে আপনার MHD অ্যাকাউন্ট তৈরি করুন।',noAcc:'অ্যাকাউন্ট নেই?',fullName:'পুরো নাম',dob:'জন্ম তারিখ',gender:'লিঙ্গ',bloodGroup:'রক্তের গ্রুপ',phone:'ফোন',address:'ঠিকানা',languageLbl:'ভাষা',rolePatient:'রোগী',roleDoctor:'ডাক্তার',roleHospital:'হাসপাতাল প্রশাসক',registerDoctor:'ডাক্তার হিসেবে রেজিস্টার',registerHospital:'হাসপাতাল রেজিস্টার করুন',
  quickActions:'দ্রুত কাজ',bookAppt:'অ্যাপয়েন্টমেন্ট বুক করুন',talkDoctor:'ডাক্তারের সাথে কথা বলুন',newCase:'নতুন / আমার কেস',todaySchedule:'আজকের সময়সূচি',activeMeds:'চলমান ওষুধ',recentResults:'সাম্প্রতিক ফলাফল',recovery:'আরোগ্য অগ্রগতি',upcomingAppt:'আসন্ন অ্যাপয়েন্টমেন্ট',viewDetails:'বিস্তারিত দেখুন',allMeds:'সব ওষুধ',allResults:'সব ফলাফল',billingHistory:'বিলের ইতিহাস',careStatus:'চিকিৎসা অবস্থা',noUpcomingAppts:'কোনো আসন্ন অ্যাপয়েন্টমেন্ট নেই।',noBillsYet:'এখনও কোনো বিল নেই।',upcomingEvents:'আসন্ন ইভেন্ট',followReminders:'ফলো-আপ রিমাইন্ডার',addMedicine:'ওষুধ যোগ করুন',confirmAppt:'অ্যাপয়েন্টমেন্ট নিশ্চিত করুন',upcomingTab:'আসন্ন',completedTab:'সম্পন্ন',cancelledTab:'বাতিল',notifCenter:'বিজ্ঞপ্তি কেন্দ্র',profileSettings:'প্রোফাইল ও সেটিংস',emergencyBtn:'জরুরি',saveBtn:'সংরক্ষণ',closeBtn:'বন্ধ',payBtn:'পরিশোধ',pendingLbl:'বাকি',paidLbl:'পরিশোধিত',allBills:'সব বিল',verifyCenter:'ওষুধ যাচাই কেন্দ্র',loginAs:'লগইন হিসেবে',hospitalWord:'হাসপাতাল',patientDemo:'রোগী ডেমো',doctorDemo:'ডাক্তার ডেমো',hospitalDemo:'হাসপাতাল ডেমো',roleLbl:'ভূমিকা',emailAddress:'ইমেল ঠিকানা',emailPh:'আপনার ইমেল লিখুন',passPh:'আপনার পাসওয়ার্ড লিখুন',signIn:'লগইন',createAccount:'অ্যাকাউন্ট তৈরি করুন',demoAccounts:'→ ডেমো অ্যাকাউন্ট',demoHint:'ডেমো অ্যাকাউন্ট — প্রথম ব্যবহারে স্বয়ংক্রিয়ভাবে তৈরি হয়। পাসওয়ার্ড: demo123',demoFill:'ডেমো চেষ্টা করুন (নমুনা ডেটা)',healthStatus:'স্বাস্থ্য অবস্থা',nextApptLbl:'পরবর্তী অ্যাপয়েন্টমেন্ট',viewLink:'দেখুন →',viewAll:'সব দেখুন →',todaysMeds:'আজকের ওষুধ',waitingReview:'ডাক্তার পর্যালোচনার জন্য অপেক্ষমাণ',recoStart:'আরোগ্য ট্র্যাক করতে আপনার প্রথম কেস জমা দিন।',recoGreat:'আপনি খুব ভালো করছেন! চিকিৎসা পরিকল্পনা চালিয়ে যান।',recoDoing:'আপনি ভালো আছেন। বর্তমান চিকিৎসা পরিকল্পনা চালিয়ে যান।',activeSub:'সক্রিয়',upcomingSub:'আসন্ন',totalSub:'মোট',unreadSub:'অপঠিত',takenLbl:'খাওয়া হয়েছে',verifiedLbl:'যাচাইকৃত',markTaken:'খাওয়া হয়েছে চিহ্নিত করুন',followDue:'ফলো-আপ বাকি'},
 mr:{dashboard:'डॅशबोर्ड',upcoming:'आगामी',mycase:'माझा केस',meds:'औषधे',results:'माझे निकाल',appts:'अपॉइंटमेंट',doctors:'माझे डॉक्टर',timeline:'टाइमलाइन',tracking:'आरोग्य आढावा',qr:'माझा QR',privacy:'गोपनीयता व प्रवेश',billing:'बिल',notifs:'सूचना',settings:'सेटिंग्ज',emergency:'आपत्कालीन',logout:'लॉगआउट',cases:'केस',verify:'औषध पडताळणी',chats:'संदेश',patients:'रुग्ण',dappts:'माझी अपॉइंटमेंट',earnings:'माझी कमाई',healthinput:'आरोग्य नोंद',hdash:'रुग्णालय डॅशबोर्ड',hpatients:'सर्व रुग्ण',hdoctors:'सर्व डॉक्टर',hcases:'सर्व केस',hmeds:'औषधे',hdocs:'दस्तऐवज पडताळणी',happts:'अपॉइंटमेंट',hupload:'निकाल अपलोड',greetM:'शुभ प्रभात',greetA:'नमस्कार',greetE:'शुभ संध्याकाळ',page:'MHD रुग्णालय',loginH:'पुन्हा स्वागत आहे',loginSub:'तुमच्या हेल्थ पोर्टलवर सुरू ठेवण्यासाठी लॉगिन करा',email:'ईमेल',password:'पासवर्ड',remember:'मला लक्षात ठेवा',forgot:'पासवर्ड विसरलात?',loginBtn:'लॉगिन',haveAcc:'खाते आहे का?',createAcc:'हेल्थ आयडी तयार करा',demoBtn:'डेमो लॉगिन',
  register:'नोंदणी करा',welcomeBack:'पुन्हा आलात! पुढे जाण्यासाठी लॉगिन करा.',createAccSub:'पुढे जाण्यासाठी तुमचे MHD खाते तयार करा.',noAcc:'खाते नाही आहे?',fullName:'पूर्ण नाव',dob:'जन्म तारीख',gender:'लिंग',bloodGroup:'रक्तगट',phone:'फोन',address:'पत्ता',languageLbl:'भाषा',rolePatient:'रुग्ण',roleDoctor:'डॉक्टर',roleHospital:'हॉस्पिटल प्रशासक',registerDoctor:'डॉक्टर म्हणून नोंदणी',registerHospital:'हॉस्पिटल नोंदणी करा',
  quickActions:'जलद कृती',bookAppt:'अपॉइंटमेंट बुक करा',talkDoctor:'डॉक्टरांशी बोला',newCase:'नवीन / माझा केस',todaySchedule:'आजचे वेळापत्रक',activeMeds:'सक्रिय औषधे',recentResults:'अलीकडील निकाल',recovery:'पुनर्प्राप्ती प्रगती',upcomingAppt:'आगामी अपॉइंटमेंट',viewDetails:'तपशील पहा',allMeds:'सर्व औषधे',allResults:'सर्व निकाल',billingHistory:'बिल इतिहास',careStatus:'काळजी स्थिती',noUpcomingAppts:'आगामी अपॉइंटमेंट नाहीत.',noBillsYet:'अजून बिल नाहीत.',upcomingEvents:'आगामी कार्यक्रम',followReminders:'फॉलो-अप स्मरणपत्रे',addMedicine:'औषध जोडा',confirmAppt:'अपॉइंटमेंट निश्चित करा',upcomingTab:'आगामी',completedTab:'पूर्ण',cancelledTab:'रद्द',notifCenter:'सूचना केंद्र',profileSettings:'प्रोफाइल व सेटिंग्ज',emergencyBtn:'आपत्कालीन',saveBtn:'जतन करा',closeBtn:'बंद करा',payBtn:'पेमेंट करा',pendingLbl:'बाकी',paidLbl:'भरले',allBills:'सर्व बिल',verifyCenter:'औषध पडताळणी केंद्र',loginAs:'लॉगिन म्हणून',hospitalWord:'रुग्णालय',patientDemo:'रुग्ण डेमो',doctorDemo:'डॉक्टर डेमो',hospitalDemo:'हॉस्पिटल डेमो',roleLbl:'भूमिका',emailAddress:'ईमेल पत्ता',emailPh:'तुमचा ईमेल पत्ता टाका',passPh:'तुमचा पासवर्ड टाका',signIn:'लॉगिन',createAccount:'खाते तयार करा',demoAccounts:'→ डेमो खाती',demoHint:'डेमो खाती — पहिल्या वापरावर आपोआप तयार होतात. पासवर्ड: demo123',demoFill:'डेमो पहा (नमुना डेटा)',healthStatus:'आरोग्य स्थिती',nextApptLbl:'पुढील अपॉइंटमेंट',viewLink:'पहा →',viewAll:'सर्व पहा →',todaysMeds:'आजची औषधे',waitingReview:'डॉक्टर तपासणीसाठी प्रतीक्षा',recoStart:'पुनर्प्राप्ती मागोवा घेण्यासाठी तुमचे पहिले केस सबमिट करा.',recoGreat:'तुम्ही खूप छान करत आहात! काळजी योजना सुरू ठेवा.',recoDoing:'तुम्ही बरे आहात. वर्तमान काळजी योजना सुरू ठेवा.',activeSub:'सक्रिय',upcomingSub:'आगामी',totalSub:'एकूण',unreadSub:'न वाचलेले',takenLbl:'घेतले',verifiedLbl:'पडताळले',markTaken:'घेतले असे चिन्हांकित करा',followDue:'फॉलो-अप बाकी'},
 gu:{dashboard:'ડેશબોર્ડ',upcoming:'આગામી',mycase:'મારો કેસ',meds:'દવાઓ',results:'મારા પરિણામો',appts:'એપોઇન્ટમેન્ટ',doctors:'મારા ડૉક્ટર',timeline:'ટાઇમલાઇન',tracking:'આરોગ્ય ઝાંખી',qr:'મારો QR',privacy:'ગોપનીયતા અને પ્રવેશ',billing:'બિલ',notifs:'સૂચનાઓ',settings:'સેટિંગ્સ',emergency:'કટોકટી',logout:'લોગ આઉટ',cases:'કેસ',verify:'દવા ચકાસણી',chats:'સંદેશા',patients:'દર્દીઓ',dappts:'મારી એપોઇન્ટમેન્ટ',earnings:'મારી કમાણી',healthinput:'આરોગ્ય એન્ટ્રી',hdash:'હોસ્પિટલ ડેશબોર્ડ',hpatients:'બધા દર્દીઓ',hdoctors:'બધા ડૉક્ટર',hcases:'બધા કેસ',hmeds:'દવાઓ',hdocs:'દસ્તાવેજ ચકાસણી',happts:'એપોઇન્ટમેન્ટ',hupload:'પરિણામ અપલોડ',greetM:'સુપ્રભાત',greetA:'શુભ બપોર',greetE:'શુભ સાંજ',page:'MHD હોસ્પિટલ',loginH:'ફરી સ્વાગત છે',loginSub:'તમારા હેલ્થ પોર્ટલ પર આગળ વધવા લોગિન કરો',email:'ઈમેલ',password:'પાસવર્ડ',remember:'મને યાદ રાખો',forgot:'પાસવર્ડ ભૂલી ગયા?',loginBtn:'લોગિન',haveAcc:'ખાતું છે?',createAcc:'હેલ્થ આઈડી બનાવો',demoBtn:'ડેમો લોગિન',
  register:'નોંધણી કરો',welcomeBack:'પાછા આવ્યા તમને સ્વાગત! ચાલુ રાખવા લોગિન કરો.',createAccSub:'ચાલુ રાખવા તમારું MHD ખાતું બનાવો.',noAcc:'ખાતું નથી?',fullName:'પૂરું નામ',dob:'જન્મ તારીખ',gender:'લિંગ',bloodGroup:'લોહી જૂથ',phone:'ફોન',address:'સરનામું',languageLbl:'ભાષા',rolePatient:'દર્દી',roleDoctor:'ડૉક્ટર',roleHospital:'હોસ્પિટલ એડમિન',registerDoctor:'ડૉક્ટર તરીકે નોંધણી',registerHospital:'હોસ્પિટલ નોંધણી કરો',
  quickActions:'ઝડપી ક્રિયાઓ',bookAppt:'એપોઇન્ટમેન્ટ બુક કરો',talkDoctor:'ડૉક્ટર સાથે વાત કરો',newCase:'નવો / મારો કેસ',todaySchedule:'આજનો શેડ્યૂલ',activeMeds:'સક્રિય દવાઓ',recentResults:'તાજા પરિણામો',recovery:'સ્વસ્થતા પ્રગતિ',upcomingAppt:'આગામી એપોઇન્ટમેન્ટ',viewDetails:'વિગતો જુઓ',allMeds:'બધી દવાઓ',allResults:'બધા પરિણામો',billingHistory:'બિલ ઇતિહાસ',careStatus:'સંભાળ સ્થિતિ',noUpcomingAppts:'કોઈ આગામી એપોઇન્ટમેન્ટ નથી.',noBillsYet:'હજુ બિલ નથી.',upcomingEvents:'આગામી કાર્યક્રમો',followReminders:'ફોલો-અપ રીમાઈન્ડર',addMedicine:'દવા ઉમેરો',confirmAppt:'એપોઇન્ટમેન્ટ પકકી કરો',upcomingTab:'આગામી',completedTab:'પૂર્ણ',cancelledTab:'રદ',notifCenter:'સૂચના કેન્દ્ર',profileSettings:'પ્રોફાઇલ અને સેટિંગ્સ',emergencyBtn:'કટોકટી',saveBtn:'સાચવો',closeBtn:'બંધ કરો',payBtn:'ચૂકવો',pendingLbl:'બાકી',paidLbl:'ચૂકવેલ',allBills:'બધા બિલ',verifyCenter:'દવા ચકાસણી કેન્દ્ર',loginAs:'લોગિન તરીકે',hospitalWord:'હોસ્પિટલ',patientDemo:'દર્દી ડેમો',doctorDemo:'ડૉક્ટર ડેમો',hospitalDemo:'હોસ્પિટલ ડેમો',roleLbl:'भूमिका',emailAddress:'ઈમેલ સરનામું',emailPh:'તમારું ઈમેલ લખો',passPh:'તમારો પાસવર્ડ લખો',signIn:'લોગિન',createAccount:'ખાતું બનાવો',demoAccounts:'→ ડેમો ખાતાઓ',demoHint:'ડેમો ખાતા — પહેલી વાર વાપરવાથી આપોઆપ બને છે. પાસવર્ડ: demo123',demoFill:'ડેમો અજમાવો (નમૂનો ડેટા)',healthStatus:'આરોગ્ય સ્થિતિ',nextApptLbl:'આગામી એપોઇન્ટમેન્ટ',viewLink:'જુઓ →',viewAll:'બધું જુઓ →',todaysMeds:'આજની દવાઓ',waitingReview:'ડૉક્ટર સમીક્ષા માટે રાહ જોવાય છે',recoStart:'સ્વસ્થતા ટ્રેક કરવા તમારો પહેલો કેસ સબમિટ કરો.',recoGreat:'તમે ખૂબ સારું કરી રહ્યા છો! સંભાળ યોજના ચાલુ રાખો.',recoDoing:'તમે સારા છો. વર્તમાન સંભાળ યોજના ચાલુ રાખો.',activeSub:'સક્રિય',upcomingSub:'આગામી',totalSub:'કુલ',unreadSub:'ન વંચાયેલ',takenLbl:'લીધું',verifiedLbl:'ચકાસેલ',markTaken:'લીધું ચિહ્નિત કરો',followDue:'ફોલો-અપ બાકી'},
 pa:{dashboard:'ਡੈਸ਼ਬੋਰਡ',upcoming:'ਆਉਣ ਵਾਲੇ',mycase:'ਮੇਰਾ ਕੇਸ',meds:'ਦਵਾਈਆਂ',results:'ਮੇਰੇ ਨਤੀਜੇ',appts:'ਅਪਾਇੰਟਮੈਂਟ',doctors:'ਮੇਰੇ ਡਾਕਟਰ',timeline:'ਟਾਈਮਲਾਈਨ',tracking:'ਸਿਹਤ ਝਲਕ',qr:'ਮੇਰਾ QR',privacy:'ਗੁਪਤਤਾ ਅਤੇ ਪਹੁੰਚ',billing:'ਬਿੱਲ',notifs:'ਸੂਚਨਾਵਾਂ',settings:'ਸੈਟਿੰਗਾਂ',emergency:'ਐਮਰਜੈਂਸੀ',logout:'ਲੌਗ ਆਉਟ',cases:'ਕੇਸ',verify:'ਦਵਾਈ ਪੁਸ਼ਟੀ',chats:'ਸੁਨੇਹੇ',patients:'ਮਰੀਜ਼',dappts:'ਮੇਰੀਆਂ ਅਪਾਇੰਟਮੈਂਟਾਂ',earnings:'ਮੇਰੀ ਕਮਾਈ',healthinput:'ਸਿਹਤ ਐਂਟਰੀ',hdash:'ਹਸਪਤਾਲ ਡੈਸ਼ਬੋਰਡ',hpatients:'ਸਾਰੇ ਮਰੀਜ਼',hdoctors:'ਸਾਰੇ ਡਾਕਟਰ',hcases:'ਸਾਰੇ ਕੇਸ',hmeds:'ਦਵਾਈਆਂ',hdocs:'ਦਸਤਾਵੇਜ਼ ਪੁਸ਼ਟੀ',happts:'ਅਪਾਇੰਟਮੈਂਟ',hupload:'ਨਤੀਜਾ ਅੱਪਲੋਡ',greetM:'ਸ਼ੁਭ ਸਵੇਰ',greetA:'ਸ਼ੁਭ ਦੁਪਹਿਰ',greetE:'ਸ਼ੁਭ ਸ਼ਾਮ',page:'MHD ਹਸਪਤਾਲ',loginH:'ਮੁੜ ਜੀ ਆਇਆਂ ਨੂੰ',loginSub:'ਆਪਣੇ ਸਿਹਤ ਪੋਰਟਲ ਤੱਕ ਜਾਰੀ ਰੱਖਣ ਲਈ ਲੌਗਿਨ ਕਰੋ',email:'ਈਮੇਲ',password:'ਪਾਸਵਰਡ',remember:'ਮੈਨੂੰ ਯਾਦ ਰੱਖੋ',forgot:'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',loginBtn:'ਲੌਗਿਨ',haveAcc:'ਖਾਤਾ ਹੈ?',createAcc:'ਸਿਹਤ ਆਈਡੀ ਬਣਾਓ',demoBtn:'ਡੈਮੋ ਲੌਗਿਨ',
  register:'ਰਜਿਸਟਰ ਕਰੋ',welcomeBack:'ਵਾਪਸ ਆਉਣ ਲਈ ਜੀ ਆਇਆਂ! ਜਾਰੀ ਰੱਖਣ ਲਈ ਲੌਗਿਨ ਕਰੋ।',createAccSub:'ਜਾਰੀ ਰੱਖਣ ਲਈ ਆਪਣਾ MHD ਖਾਤਾ ਬਣਾਓ।',noAcc:'ਖਾਤਾ ਨਹੀਂ ਹੈ?',fullName:'ਪੂਰਾ ਨਾਮ',dob:'ਜਨਮ ਤਾਰੀਖ',gender:'ਲਿੰਗ',bloodGroup:'ਖੂਨ ਦੀ ਕਿਸਮ',phone:'ਫੋਨ',address:'ਪਤਾ',languageLbl:'ਭਾਸ਼ਾ',rolePatient:'ਮਰੀਜ਼',roleDoctor:'ਡਾਕਟਰ',roleHospital:'ਹਸਪਤਾਲ ਪ੍ਰਬੰਧਕ',registerDoctor:'ਡਾਕਟਰ ਵਜੋਂ ਰਜਿਸਟਰ',registerHospital:'ਹਸਪਤਾਲ ਰਜਿਸਟਰ ਕਰੋ',
  quickActions:'ਤੇਜ਼ ਕਾਰਜ',bookAppt:'ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ',talkDoctor:'ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ',newCase:'ਨਵਾਂ / ਮੇਰਾ ਕੇਸ',todaySchedule:'ਅੱਜ ਦਾ ਸ਼ਡਿਊਲ',activeMeds:'ਸਰਗਰਮ ਦਵਾਈਆਂ',recentResults:'ਹਾਲੀਆ ਨਤੀਜੇ',recovery:'ਰਿਕਵਰੀ ਤਰੱਕੀ',upcomingAppt:'ਆਉਣ ਵਾਲੀ ਅਪਾਇੰਟਮੈਂਟ',viewDetails:'ਵੇਰਵੇ ਵੇਖੋ',allMeds:'ਸਾਰੀਆਂ ਦਵਾਈਆਂ',allResults:'ਸਾਰੇ ਨਤੀਜੇ',billingHistory:'ਬਿੱਲ ਇਤਿਹਾਸ',careStatus:'ਦੇਖਭਾਲ ਸਥਿਤੀ',noUpcomingAppts:'ਕੋਈ ਆਉਣ ਵਾਲੀ ਅਪਾਇੰਟਮੈਂਟ ਨਹੀਂ।',noBillsYet:'ਹਾਲੇ ਕੋਈ ਬਿੱਲ ਨਹੀਂ।',upcomingEvents:'ਆਉਣ ਵਾਲੇ ਸਮਾਗਮ',followReminders:'ਫਾਲੋ-ਅੱਪ ਰੀਮਾਈਂਡਰ',addMedicine:'ਦਵਾਈ ਸ਼ਾਮਲ ਕਰੋ',confirmAppt:'ਅਪਾਇੰਟਮੈਂਟ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',upcomingTab:'ਆਉਣ ਵਾਲੇ',completedTab:'ਪੂਰੇ ਹੋਏ',cancelledTab:'ਰੱਦ',notifCenter:'ਸੂਚਨਾ ਕੇਂਦਰ',profileSettings:'ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੈਟਿੰਗਾਂ',emergencyBtn:'ਐਮਰਜੈਂਸੀ',saveBtn:'ਸੰਭਾਲੋ',closeBtn:'ਬੰਦ ਕਰੋ',payBtn:'ਭੁਗਤਾਨ ਕਰੋ',pendingLbl:'ਬਾਕੀ',paidLbl:'ਭੁਗਤਾਨ ਹੋਇਆ',allBills:'ਸਾਰੇ ਬਿੱਲ',verifyCenter:'ਦਵਾਈ ਪੁਸ਼ਟੀ ਕੇਂਦਰ',loginAs:'ਲੌਗਿਨ ਵਜੋਂ',hospitalWord:'ਹਸਪਤਾਲ',patientDemo:'ਮਰੀਜ਼ ਡੈਮੋ',doctorDemo:'ਡਾਕਟਰ ਡੈਮੋ',hospitalDemo:'ਹਸਪਤਾਲ ਡੈਮੋ',roleLbl:'ਭੂਮਿਕਾ',emailAddress:'ਈਮੇਲ ਪਤਾ',emailPh:'ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ',passPh:'ਆਪਣਾ ਪਾਸਵਰਡ ਦਰਜ ਕਰੋ',signIn:'ਲੌਗਿਨ',createAccount:'ਖਾਤਾ ਬਣਾਓ',demoAccounts:'→ ਡੈਮੋ ਖਾਤੇ',demoHint:'ਡੈਮੋ ਖਾਤੇ — ਪਹਿਲੀ ਵਾਰ ਵਰਤਣ ਤੇ ਆਪਣੇ-ਆਪ ਬਣ ਜਾਂਦੇ ਹਨ। ਪਾਸਵਰਡ: demo123',demoFill:'ਡੈਮੋ ਅਜ਼ਮਾਓ (ਨਮੂਨਾ ਡਾਟਾ)',healthStatus:'ਸਿਹਤ ਸਥਿਤੀ',nextApptLbl:'ਅਗਲੀ ਅਪਾਇੰਟਮੈਂਟ',viewLink:'ਵੇਖੋ →',viewAll:'ਸਭ ਵੇਖੋ →',todaysMeds:'ਅੱਜ ਦੀਆਂ ਦਵਾਈਆਂ',waitingReview:'ਡਾਕਟਰ ਸਮੀਖਿਆ ਲਈ ਉਡੀਕ',recoStart:'ਰਿਕਵਰੀ ਟ੍ਰੈਕ ਕਰਨ ਲਈ ਆਪਣਾ ਪਹਿਲਾ ਕੇਸ ਸਬਮਿਟ ਕਰੋ।',recoGreat:'ਤੁਸੀਂ ਬਹੁਤ ਵਧੀਆ ਕਰ ਰਹੇ ਹੋ! ਦੇਖਭਾਲ ਯੋਜਨਾ ਜਾਰੀ ਰੱਖੋ।',recoDoing:'ਤੁਸੀਂ ਠੀਕ ਹੋ। ਮੌਜੂਦਾ ਦੇਖਭਾਲ ਯੋਜਨਾ ਜਾਰੀ ਰੱਖੋ।',activeSub:'ਸਰਗਰਮ',upcomingSub:'ਆਉਣ ਵਾਲੇ',totalSub:'ਕੁੱਲ',unreadSub:'ਨਾ ਪੜ੍ਹੇ',takenLbl:'ਲਈ ਗਈ',verifiedLbl:'ਪੁਸ਼ਟੀਕਰਤ',markTaken:'ਲਈ ਗਈ ਨਿਸ਼ਾਨਦੇਹ ਕਰੋ',followDue:'ਫਾਲੋ-ਅੱਪ ਬਾਕੀ'}
};
let CUR_LANG = localStorage.getItem('mhd_lang') || 'en';

Object.assign(I18N.en, {
  patientsWaitingReview: 'Your Patients Waiting for Review',
  clickPatientPortal: '(click a name → their full portal)',
  scheduleTodayQueue: 'Your Schedule Today — Time & Queue',
  dutyLiveLocation: 'Duty & Live Location',
  dutyDescription: 'When ON, patients see your live GPS on the Doctor Map. Deleted automatically on logout; older than 6 min = offline.',
  onDutyText: 'ON DUTY — location visible (tap to go off duty)',
  offDutyText: 'OFF DUTY — tap to go on duty',
  medicineVerification: 'Medicine Verification — your confirmation unlocks treatment',
  medicineVerificationDesc: 'Patient-reported medicines stay RED until YOU verify them. Once confirmed, they turn GREEN on the patient portal instantly.',
  medicinePending: 'MEDICINE PENDING — CLICK TO VERIFY NOW',
  medicinesPending: 'MEDICINES PENDING — CLICK TO VERIFY NOW',
  allMedicinesVerified: 'ALL MEDICINES VERIFIED — GREAT WORK, DOCTOR',
  noPendingCases: 'No pending cases — all caught up!',
  noAppointmentsToday: 'No appointments today.',
  done: 'Done',
  review: 'Review →',
  yourWaitingCases: 'Your Waiting Cases',
  yourPatientsToday: 'Your Patients Today',
  yourPatients: 'Your Patients',
  yourVerifications: 'Your Verifications',
  unread: 'Unread'
});

Object.assign(I18N.hi, {
  patientsWaitingReview: 'आपके मरीज़ समीक्षा की प्रतीक्षा में',
  clickPatientPortal: '(नाम पर क्लिक करके पूरा पोर्टल देखें)',
  scheduleTodayQueue: 'आज का शेड्यूल — समय और कतार',
  dutyLiveLocation: 'ड्यूटी और लाइव लोकेशन',
  dutyDescription: 'ड्यूटी ON होने पर मरीज़ डॉक्टर मैप पर आपकी लाइव GPS लोकेशन देख सकते हैं। लॉगआउट पर अपने आप हट जाती है; 6 मिनट से पुरानी लोकेशन ऑफलाइन मानी जाती है।',
  onDutyText: 'ड्यूटी पर — लोकेशन दिखाई दे रही है (ड्यूटी बंद करने के लिए टैप करें)',
  offDutyText: 'ड्यूटी बंद — ड्यूटी शुरू करने के लिए टैप करें',
  medicineVerification: 'दवा सत्यापन — आपकी पुष्टि से उपचार शुरू होगा',
  medicineVerificationDesc: 'मरीज़ द्वारा बताई गई दवाएँ आपकी पुष्टि तक RED रहती हैं। पुष्टि के बाद वे मरीज़ के पोर्टल पर GREEN हो जाती हैं।',
  medicinePending: 'दवा लंबित — अभी सत्यापित करने के लिए क्लिक करें',
  medicinesPending: 'दवाएँ लंबित — अभी सत्यापित करने के लिए क्लिक करें',
  allMedicinesVerified: 'सभी दवाएँ सत्यापित — बहुत बढ़िया, डॉक्टर',
  noPendingCases: 'कोई लंबित केस नहीं — सभी पूरे हो गए!',
  noAppointmentsToday: 'आज कोई अपॉइंटमेंट नहीं है।',
  done: 'पूर्ण',
  review: 'समीक्षा →',
  yourWaitingCases: 'आपके प्रतीक्षारत केस',
  yourPatientsToday: 'आज के आपके मरीज़',
  yourPatients: 'आपके मरीज़',
  yourVerifications: 'आपके सत्यापन',
  unread: 'अपठित'
});

Object.assign(I18N.ta, {
  patientsWaitingReview: 'மருத்துவர் மதிப்பாய்வுக்காக காத்திருக்கும் நோயாளிகள்',
  clickPatientPortal: '(பெயரை கிளிக் செய்து முழு போர்ட்டலைப் பார்க்கவும்)',
  scheduleTodayQueue: 'இன்றைய அட்டவணை — நேரம் மற்றும் வரிசை',
  dutyLiveLocation: 'பணி மற்றும் நேரலை இருப்பிடம்',
  dutyDescription: 'பணி ON நிலையில் இருந்தால், நோயாளிகள் மருத்துவர் வரைபடத்தில் உங்கள் நேரலை GPS இருப்பிடத்தைப் பார்க்கலாம். வெளியேறும்போது தானாக நீக்கப்படும்; 6 நிமிடங்களுக்கு மேல் பழைய இருப்பிடம் ஆஃப்லைன் எனக் கருதப்படும்.',
  onDutyText: 'பணியில் — இருப்பிடம் தெரியும் (பணியை நிறுத்த தட்டவும்)',
  offDutyText: 'பணியில் இல்லை — பணியைத் தொடங்க தட்டவும்',
  medicineVerification: 'மருந்து சரிபார்ப்பு — உங்கள் உறுதிப்படுத்தல் சிகிச்சையைத் திறக்கும்',
  medicineVerificationDesc: 'நோயாளி தெரிவித்த மருந்துகள் நீங்கள் சரிபார்க்கும் வரை RED ஆக இருக்கும். உறுதிப்படுத்தியதும் நோயாளியின் போர்ட்டலில் GREEN ஆக மாறும்.',
  medicinePending: 'மருந்து நிலுவையில் உள்ளது — இப்போது சரிபார்க்க கிளிக் செய்யவும்',
  medicinesPending: 'மருந்துகள் நிலுவையில் உள்ளன — இப்போது சரிபார்க்க கிளிக் செய்யவும்',
  allMedicinesVerified: 'அனைத்து மருந்துகளும் சரிபார்க்கப்பட்டன — அருமை, மருத்துவரே',
  noPendingCases: 'நிலுவையில் உள்ள கேஸ்கள் இல்லை — அனைத்தும் முடிந்தது!',
  noAppointmentsToday: 'இன்று சந்திப்புகள் எதுவும் இல்லை.',
  done: 'முடிந்தது',
  review: 'மதிப்பாய்வு →',
  yourWaitingCases: 'மதிப்பாய்வுக்காக காத்திருக்கும் கேஸ்கள்',
  yourPatientsToday: 'இன்றைய உங்கள் நோயாளிகள்',
  yourPatients: 'உங்கள் நோயாளிகள்',
  yourVerifications: 'உங்கள் சரிபார்ப்புகள்',
  unread: 'படிக்காதவை'
});

Object.assign(I18N.te, {
  patientsWaitingReview: 'సమీక్ష కోసం వేచి ఉన్న మీ రోగులు',
  clickPatientPortal: '(పూర్తి పోర్టల్ చూడటానికి పేరుపై క్లిక్ చేయండి)',
  scheduleTodayQueue: 'ఈరోజు షెడ్యూల్ — సమయం & క్యూ',
  dutyLiveLocation: 'డ్యూటీ & లైవ్ లొకేషన్',
  dutyDescription: 'డ్యూటీ ON లో ఉన్నప్పుడు, రోగులు డాక్టర్ మ్యాప్‌లో మీ లైవ్ GPS లొకేషన్‌ను చూడగలరు. లాగ్‌అవుట్‌లో స్వయంచాలకంగా తొలగించబడుతుంది; 6 నిమిషాల కంటే పాతది ఆఫ్‌లైన్‌గా పరిగణించబడుతుంది.',
  onDutyText: 'డ్యూటీలో — లొకేషన్ కనిపిస్తుంది (డ్యూటీ ఆపడానికి ట్యాప్ చేయండి)',
  offDutyText: 'డ్యూటీలో లేరు — డ్యూటీ ప్రారంభించడానికి ట్యాప్ చేయండి',
  medicineVerification: 'మందు ధృవీకరణ — మీ నిర్ధారణ చికిత్సను ప్రారంభిస్తుంది',
  medicineVerificationDesc: 'రోగి తెలిపిన మందులు మీరు ధృవీకరించే వరకు RED గా ఉంటాయి. ధృవీకరించిన తర్వాత రోగి పోర్టల్‌లో GREEN గా మారుతాయి.',
  medicinePending: 'మందు పెండింగ్ — ఇప్పుడే ధృవీకరించడానికి క్లిక్ చేయండి',
  medicinesPending: 'మందులు పెండింగ్ — ఇప్పుడే ధృవీకరించడానికి క్లిక్ చేయండి',
  allMedicinesVerified: 'అన్ని మందులు ధృవీకరించబడ్డాయి — అద్భుతం, డాక్టర్',
  noPendingCases: 'పెండింగ్ కేసులు లేవు — అన్నీ పూర్తయ్యాయి!',
  noAppointmentsToday: 'ఈరోజు అపాయింట్‌మెంట్లు లేవు.',
  done: 'పూర్తయింది',
  review: 'సమీక్ష →',
  yourWaitingCases: 'మీ పెండింగ్ కేసులు',
  yourPatientsToday: 'ఈరోజు మీ రోగులు',
  yourPatients: 'మీ రోగులు',
  yourVerifications: 'మీ ధృవీకరణలు',
  unread: 'చదవనివి'
});

Object.assign(I18N.ml, {
  patientsWaitingReview: 'അവലോകനത്തിനായി കാത്തിരിക്കുന്ന നിങ്ങളുടെ രോഗികൾ',
  clickPatientPortal: '(പൂർണ്ണ പോർട്ടൽ കാണാൻ പേരിൽ ക്ലിക്ക് ചെയ്യുക)',
  scheduleTodayQueue: 'ഇന്നത്തെ ഷെഡ്യൂൾ — സമയവും ക്യൂവും',
  dutyLiveLocation: 'ഡ്യൂട്ടിയും ലൈവ് ലൊക്കേഷനും',
  dutyDescription: 'ഡ്യൂട്ടി ON ആണെങ്കിൽ രോഗികൾക്ക് ഡോക്ടർ മാപ്പിൽ നിങ്ങളുടെ ലൈവ് GPS ലൊക്കേഷൻ കാണാം. ലോഗൗട്ടിൽ സ്വയമേവ ഇല്ലാതാകും; 6 മിനിറ്റിൽ കൂടുതൽ പഴയത് ഓഫ്‌ലൈൻ ആയി കണക്കാക്കും.',
  onDutyText: 'ഡ്യൂട്ടിയിൽ — ലൊക്കേഷൻ കാണാം (ഡ്യൂട്ടി നിർത്താൻ ടാപ്പ് ചെയ്യുക)',
  offDutyText: 'ഡ്യൂട്ടിയിൽ ഇല്ല — ഡ്യൂട്ടി ആരംഭിക്കാൻ ടാപ്പ് ചെയ്യുക',
  medicineVerification: 'മരുന്ന് സ്ഥിരീകരണം — നിങ്ങളുടെ സ്ഥിരീകരണം ചികിത്സ ആരംഭിക്കും',
  medicineVerificationDesc: 'രോഗി റിപ്പോർട്ട് ചെയ്ത മരുന്നുകൾ നിങ്ങൾ സ്ഥിരീകരിക്കുന്നതുവരെ RED ആയിരിക്കും. സ്ഥിരീകരിച്ചാൽ രോഗിയുടെ പോർട്ടലിൽ GREEN ആയി മാറും.',
  medicinePending: 'മരുന്ന് ബാക്കി — ഇപ്പോൾ സ്ഥിരീകരിക്കാൻ ക്ലിക്ക് ചെയ്യുക',
  medicinesPending: 'മരുന്നുകൾ ബാക്കി — ഇപ്പോൾ സ്ഥിരീകരിക്കാൻ ക്ലിക്ക് ചെയ്യുക',
  allMedicinesVerified: 'എല്ലാ മരുന്നുകളും സ്ഥിരീകരിച്ചു — വളരെ നന്നായി, ഡോക്ടർ',
  noPendingCases: 'ബാക്കി കേസുകളില്ല — എല്ലാം പൂർത്തിയായി!',
  noAppointmentsToday: 'ഇന്ന് അപ്പോയിന്റ്മെന്റുകൾ ഇല്ല.',
  done: 'പൂർത്തിയായി',
  review: 'അവലോകനം →',
  yourWaitingCases: 'അവലോകനത്തിനായി കാത്തിരിക്കുന്ന കേസുകൾ',
  yourPatientsToday: 'ഇന്നത്തെ നിങ്ങളുടെ രോഗികൾ',
  yourPatients: 'നിങ്ങളുടെ രോഗികൾ',
  yourVerifications: 'നിങ്ങളുടെ സ്ഥിരീകരണങ്ങൾ',
  unread: 'വായിക്കാത്തവ'
});

Object.assign(I18N.kn, {
  patientsWaitingReview: 'ಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯುತ್ತಿರುವ ನಿಮ್ಮ ರೋಗಿಗಳು',
  clickPatientPortal: '(ಪೂರ್ಣ ಪೋರ್ಟಲ್ ನೋಡಲು ಹೆಸರನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ)',
  scheduleTodayQueue: 'ಇಂದಿನ ವೇಳಾಪಟ್ಟಿ — ಸಮಯ ಮತ್ತು ಸರದಿ',
  dutyLiveLocation: 'ಡ್ಯೂಟಿ ಮತ್ತು ಲೈವ್ ಸ್ಥಳ',
  dutyDescription: 'ಡ್ಯೂಟಿ ON ಇದ್ದಾಗ ರೋಗಿಗಳು ಡಾಕ್ಟರ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಲೈವ್ GPS ಸ್ಥಳವನ್ನು ನೋಡಬಹುದು. ಲಾಗ್‌ಔಟ್ ಆದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಳಿಸಲಾಗುತ್ತದೆ; 6 ನಿಮಿಷಕ್ಕಿಂತ ಹಳೆಯ ಸ್ಥಳ ಆಫ್‌ಲೈನ್ ಎಂದು ಪರಿಗಣಿಸಲಾಗುತ್ತದೆ.',
  onDutyText: 'ಡ್ಯೂಟಿಯಲ್ಲಿ — ಸ್ಥಳ ಗೋಚರಿಸುತ್ತದೆ (ಡ್ಯೂಟಿ ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ)',
  offDutyText: 'ಡ್ಯೂಟಿಯಲ್ಲಿ ಇಲ್ಲ — ಡ್ಯೂಟಿ ಪ್ರಾರಂಭಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
  medicineVerification: 'ಔಷಧ ಪರಿಶೀಲನೆ — ನಿಮ್ಮ ದೃಢೀಕರಣವು ಚಿಕಿತ್ಸೆಯನ್ನು ಪ್ರಾರಂಭಿಸುತ್ತದೆ',
  medicineVerificationDesc: 'ರೋಗಿ ತಿಳಿಸಿದ ಔಷಧಿಗಳು ನೀವು ಪರಿಶೀಲಿಸುವವರೆಗೆ RED ಆಗಿರುತ್ತವೆ. ದೃಢೀಕರಿಸಿದ ನಂತರ ರೋಗಿಯ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ GREEN ಆಗುತ್ತವೆ.',
  medicinePending: 'ಔಷಧಿ ಬಾಕಿಯಿದೆ — ಈಗ ಪರಿಶೀಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
  medicinesPending: 'ಔಷಧಿಗಳು ಬಾಕಿಯಿವೆ — ಈಗ ಪರಿಶೀಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ',
  allMedicinesVerified: 'ಎಲ್ಲಾ ಔಷಧಿಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ — ಅದ್ಭುತ, ವೈದ್ಯರೇ',
  noPendingCases: 'ಬಾಕಿ ಪ್ರಕರಣಗಳಿಲ್ಲ — ಎಲ್ಲವೂ ಮುಗಿದಿದೆ!',
  noAppointmentsToday: 'ಇಂದು ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳಿಲ್ಲ.',
  done: 'ಮುಗಿದಿದೆ',
  review: 'ಪರಿಶೀಲನೆ →',
  yourWaitingCases: 'ನಿಮ್ಮ ಕಾಯುತ್ತಿರುವ ಪ್ರಕರಣಗಳು',
  yourPatientsToday: 'ಇಂದಿನ ನಿಮ್ಮ ರೋಗಿಗಳು',
  yourPatients: 'ನಿಮ್ಮ ರೋಗಿಗಳು',
  yourVerifications: 'ನಿಮ್ಮ ಪರಿಶೀಲನೆಗಳು',
  unread: 'ಓದದವು'
});

Object.assign(I18N.bn, {
  patientsWaitingReview: 'পর্যালোচনার জন্য অপেক্ষমাণ আপনার রোগীরা',
  clickPatientPortal: '(সম্পূর্ণ পোর্টাল দেখতে নামের উপর ক্লিক করুন)',
  scheduleTodayQueue: 'আজকের সময়সূচি — সময় ও সারি',
  dutyLiveLocation: 'ডিউটি ও লাইভ লোকেশন',
  dutyDescription: 'ডিউটি ON থাকলে রোগীরা ডাক্তার ম্যাপে আপনার লাইভ GPS লোকেশন দেখতে পারবেন। লগআউটের সময় স্বয়ংক্রিয়ভাবে মুছে যাবে; ৬ মিনিটের বেশি পুরোনো হলে অফলাইন ধরা হবে।',
  onDutyText: 'ডিউটিতে — লোকেশন দেখা যাচ্ছে (ডিউটি বন্ধ করতে ট্যাপ করুন)',
  offDutyText: 'ডিউটিতে নেই — ডিউটি শুরু করতে ট্যাপ করুন',
  medicineVerification: 'ওষুধ যাচাই — আপনার নিশ্চিতকরণ চিকিৎসা শুরু করবে',
  medicineVerificationDesc: 'রোগীর জানানো ওষুধগুলি আপনি যাচাই না করা পর্যন্ত RED থাকবে। নিশ্চিত করার পর রোগীর পোর্টালে GREEN হবে।',
  medicinePending: 'ওষুধ অপেক্ষমাণ — এখন যাচাই করতে ক্লিক করুন',
  medicinesPending: 'ওষুধগুলি অপেক্ষমাণ — এখন যাচাই করতে ক্লিক করুন',
  allMedicinesVerified: 'সব ওষুধ যাচাই হয়েছে — দারুণ, ডাক্তার',
  noPendingCases: 'কোনো অপেক্ষমাণ কেস নেই — সব সম্পন্ন!',
  noAppointmentsToday: 'আজ কোনো অ্যাপয়েন্টমেন্ট নেই।',
  done: 'সম্পন্ন',
  review: 'পর্যালোচনা →',
  yourWaitingCases: 'পর্যালোচনার জন্য অপেক্ষমাণ কেস',
  yourPatientsToday: 'আজকের আপনার রোগীরা',
  yourPatients: 'আপনার রোগীরা',
  yourVerifications: 'আপনার যাচাই',
  unread: 'অপঠিত'
});

Object.assign(I18N.mr, {
  patientsWaitingReview: 'तुमचे रुग्ण तपासणीच्या प्रतीक्षेत',
  clickPatientPortal: '(पूर्ण पोर्टल पाहण्यासाठी नावावर क्लिक करा)',
  scheduleTodayQueue: 'आजचे वेळापत्रक — वेळ आणि रांग',
  dutyLiveLocation: 'ड्युटी आणि लाईव्ह लोकेशन',
  dutyDescription: 'ड्युटी ON असल्यास रुग्ण डॉक्टर मॅपवर तुमचे लाईव्ह GPS लोकेशन पाहू शकतात. लॉगआउटवर आपोआप हटवले जाते; ६ मिनिटांपेक्षा जुने लोकेशन ऑफलाइन मानले जाते.',
  onDutyText: 'ड्युटीवर — लोकेशन दिसत आहे (ड्युटी बंद करण्यासाठी टॅप करा)',
  offDutyText: 'ड्युटीवर नाही — ड्युटी सुरू करण्यासाठी टॅप करा',
  medicineVerification: 'औषध पडताळणी — तुमची पुष्टी उपचार सुरू करेल',
  medicineVerificationDesc: 'रुग्णाने सांगितलेली औषधे तुम्ही पडताळेपर्यंत RED राहतात. पुष्टी केल्यानंतर रुग्णाच्या पोर्टलवर GREEN होतात.',
  medicinePending: 'औषध प्रलंबित — आता पडताळण्यासाठी क्लिक करा',
  medicinesPending: 'औषधे प्रलंबित — आता पडताळण्यासाठी क्लिक करा',
  allMedicinesVerified: 'सर्व औषधे पडताळली — उत्तम काम, डॉक्टर',
  noPendingCases: 'कोणतेही प्रलंबित केस नाहीत — सर्व पूर्ण!',
  noAppointmentsToday: 'आज कोणतीही अपॉइंटमेंट नाही.',
  done: 'पूर्ण',
  review: 'तपासणी →',
  yourWaitingCases: 'तुमचे प्रतीक्षेतील केस',
  yourPatientsToday: 'आजचे तुमचे रुग्ण',
  yourPatients: 'तुमचे रुग्ण',
  yourVerifications: 'तुमची पडताळणी',
  unread: 'न वाचलेले'
});

Object.assign(I18N.gu, {
  patientsWaitingReview: 'સમીક્ષા માટે રાહ જોઈ રહેલા તમારા દર્દીઓ',
  clickPatientPortal: '(સંપૂર્ણ પોર્ટલ જોવા નામ પર ક્લિક કરો)',
  scheduleTodayQueue: 'આજનું શેડ્યૂલ — સમય અને કતાર',
  dutyLiveLocation: 'ડ્યુટી અને લાઇવ લોકેશન',
  dutyDescription: 'ડ્યુટી ON હોય ત્યારે દર્દીઓ ડોક્ટર મેપ પર તમારું લાઇવ GPS લોકેશન જોઈ શકે છે. લોગઆઉટ વખતે આપમેળે કાઢી નાખવામાં આવે છે; 6 મિનિટથી જૂનું લોકેશન ઑફલાઇન ગણાય છે.',
  onDutyText: 'ડ્યુટી પર — લોકેશન દેખાય છે (ડ્યુટી બંધ કરવા ટેપ કરો)',
  offDutyText: 'ડ્યુટી પર નથી — ડ્યુટી શરૂ કરવા ટેપ કરો',
  medicineVerification: 'દવા ચકાસણી — તમારી પુષ્ટિ સારવાર શરૂ કરશે',
  medicineVerificationDesc: 'દર્દી દ્વારા જણાવેલી દવાઓ તમારી ચકાસણી સુધી RED રહેશે. પુષ્ટિ કર્યા પછી દર્દીના પોર્ટલમાં GREEN થઈ જશે.',
  medicinePending: 'દવા બાકી — હમણાં ચકાસવા ક્લિક કરો',
  medicinesPending: 'દવાઓ બાકી — હમણાં ચકાસવા ક્લિક કરો',
  allMedicinesVerified: 'બધી દવાઓ ચકાસાઈ — સરસ કામ, ડોક્ટર',
  noPendingCases: 'કોઈ બાકી કેસ નથી — બધું પૂર્ણ!',
  noAppointmentsToday: 'આજે કોઈ એપોઇન્ટમેન્ટ નથી.',
  done: 'પૂર્ણ',
  review: 'સમીક્ષા →',
  yourWaitingCases: 'તમારા રાહ જોઈ રહેલા કેસ',
  yourPatientsToday: 'આજના તમારા દર્દીઓ',
  yourPatients: 'તમારા દર્દીઓ',
  yourVerifications: 'તમારી ચકાસણીઓ',
  unread: 'વાંચ્યા વગરના'
});

Object.assign(I18N.pa, {
  patientsWaitingReview: 'ਸਮੀਖਿਆ ਦੀ ਉਡੀਕ ਕਰ ਰਹੇ ਤੁਹਾਡੇ ਮਰੀਜ਼',
  clickPatientPortal: '(ਪੂਰਾ ਪੋਰਟਲ ਦੇਖਣ ਲਈ ਨਾਮ ਤੇ ਕਲਿੱਕ ਕਰੋ)',
  scheduleTodayQueue: 'ਅੱਜ ਦਾ ਸ਼ਡਿਊਲ — ਸਮਾਂ ਅਤੇ ਕਤਾਰ',
  dutyLiveLocation: 'ਡਿਊਟੀ ਅਤੇ ਲਾਈਵ ਲੋਕੇਸ਼ਨ',
  dutyDescription: 'ਡਿਊਟੀ ON ਹੋਣ ਤੇ ਮਰੀਜ਼ ਡਾਕਟਰ ਮੈਪ ਤੇ ਤੁਹਾਡੀ ਲਾਈਵ GPS ਲੋਕੇਸ਼ਨ ਦੇਖ ਸਕਦੇ ਹਨ। ਲੌਗਆਉਟ ਤੇ ਆਪਣੇ ਆਪ ਮਿਟ ਜਾਂਦੀ ਹੈ; 6 ਮਿੰਟ ਤੋਂ ਪੁਰਾਣੀ ਲੋਕੇਸ਼ਨ ਆਫਲਾਈਨ ਮੰਨੀ ਜਾਂਦੀ ਹੈ।',
  onDutyText: 'ਡਿਊਟੀ ਤੇ — ਲੋਕੇਸ਼ਨ ਦਿਖ ਰਹੀ ਹੈ (ਡਿਊਟੀ ਬੰਦ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ)',
  offDutyText: 'ਡਿਊਟੀ ਤੇ ਨਹੀਂ — ਡਿਊਟੀ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਟੈਪ ਕਰੋ',
  medicineVerification: 'ਦਵਾਈ ਪੁਸ਼ਟੀ — ਤੁਹਾਡੀ ਪੁਸ਼ਟੀ ਇਲਾਜ ਸ਼ੁਰੂ ਕਰੇਗੀ',
  medicineVerificationDesc: 'ਮਰੀਜ਼ ਵੱਲੋਂ ਦੱਸੀਆਂ ਦਵਾਈਆਂ ਤੁਹਾਡੇ ਵੱਲੋਂ ਪੁਸ਼ਟੀ ਕਰਨ ਤੱਕ RED ਰਹਿੰਦੀਆਂ ਹਨ। ਪੁਸ਼ਟੀ ਤੋਂ ਬਾਅਦ ਮਰੀਜ਼ ਦੇ ਪੋਰਟਲ ਤੇ GREEN ਹੋ ਜਾਂਦੀਆਂ ਹਨ।',
  medicinePending: 'ਦਵਾਈ ਬਕਾਇਆ — ਹੁਣੇ ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
  medicinesPending: 'ਦਵਾਈਆਂ ਬਕਾਇਆ — ਹੁਣੇ ਪੁਸ਼ਟੀ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
  allMedicinesVerified: 'ਸਾਰੀਆਂ ਦਵਾਈਆਂ ਦੀ ਪੁਸ਼ਟੀ ਹੋ ਗਈ — ਸ਼ਾਬਾਸ਼, ਡਾਕਟਰ',
  noPendingCases: 'ਕੋਈ ਬਕਾਇਆ ਕੇਸ ਨਹੀਂ — ਸਭ ਪੂਰਾ!',
  noAppointmentsToday: 'ਅੱਜ ਕੋਈ ਅਪਾਇੰਟਮੈਂਟ ਨਹੀਂ।',
  done: 'ਪੂਰਾ',
  review: 'ਸਮੀਖਿਆ →',
  yourWaitingCases: 'ਤੁਹਾਡੇ ਉਡੀਕ ਰਹੇ ਕੇਸ',
  yourPatientsToday: 'ਅੱਜ ਦੇ ਤੁਹਾਡੇ ਮਰੀਜ਼',
  yourPatients: 'ਤੁਹਾਡੇ ਮਰੀਜ਼',
  yourVerifications: 'ਤੁਹਾਡੀਆਂ ਪੁਸ਼ਟੀਆਂ',
  unread: 'ਨਾ ਪੜ੍ਹੇ'
});
const t = k => (I18N[CUR_LANG] && I18N[CUR_LANG][k]) || I18N.en[k] || k;

/* English value -> key lookup, built once */
const I18N_BY_EN = (() => {
  const map = {};
  Object.keys(I18N.en).forEach(key => { const v = I18N.en[key]; if (v && !map[v]) map[v] = key; });
  return map;
})();

/* Split "💊 My Medicines →" into lead emoji / core text / trail symbols so
 * emoji-prefixed headings and buttons still match plain dictionary values. */
function i18nSplit(text) {
  const s = String(text || '').trim();
  if (!s) return null;
  const leadM = s.match(/^[^\p{L}\p{N}]+/u);
  let core = leadM ? s.slice(leadM[0].length) : s;
  const lead = leadM ? leadM[0] : '';
  const trailM = core.match(/[^\p{L}\p{N}%]+$/u);
  let trail = '';
  if (trailM && trailM[0].length < core.length) { trail = trailM[0]; core = core.slice(0, core.length - trail.length); }
  if (!core) return null;
  return { lead, core, trail };
}

function applyStaticI18N() {
  const translateElement = el => {
    if (el.hasAttribute && el.hasAttribute('data-i18n')) {
      el.textContent = t(el.getAttribute('data-i18n'));
    } else if (el.childElementCount === 0) {
      const source = el.dataset.i18nSource || el.textContent;
      const parts = i18nSplit(source);
      const key = parts && (I18N_BY_EN[parts.core] || I18N_BY_EN[source.trim()]);
      if (key) {
        el.dataset.i18nSource = source;
        const translated = t(key);
        const rebuilt = parts && I18N_BY_EN[parts.core] ? (parts.lead + translated + parts.trail) : translated;
        if (el.textContent !== rebuilt) el.textContent = rebuilt;
      }
    } else {
      /* Mixed content like "Don't have an account? <a>Register</a>":
       * translate the direct text nodes when children are inline elements. */
      const inlineOnly = [...el.children].every(c => ['A', 'SMALL', 'B', 'BR', 'SPAN', 'INPUT'].includes(c.tagName));
      if (inlineOnly) {
        if (!el.dataset.i18nMixedSrc) el.dataset.i18nMixedSrc = JSON.stringify([...el.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue));
        const srcs = JSON.parse(el.dataset.i18nMixedSrc);
        let i = 0;
        el.childNodes.forEach(n => {
          if (n.nodeType !== 3) return;
          const src = (srcs[i] || '').trim();
          const parts = i18nSplit(src);
          const key = parts && (I18N_BY_EN[parts.core] || I18N_BY_EN[parts.core + parts.trail] || I18N_BY_EN[src]);
          if (key) n.nodeValue = t(key);
          i++;
        });
      }
    }
    if (el.hasAttribute && el.hasAttribute('data-i18n-ph')) el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    if (el.hasAttribute && el.hasAttribute('data-i18n-title')) el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  };
  document.querySelectorAll('[data-i18n], [data-i18n-ph], [data-i18n-title], button, a, label, h1, h2, h3, h4, h5, p, option, small, th, td, span').forEach(translateElement);
}

function fillLangSelects() {
  ['#langSel', '#langSelAuth', '#setLang'].forEach(id => {
    const el = document.querySelector(id);
    if (!el) return;
    el.innerHTML = LANGS.map(([v, n]) => '<option value="' + v + '">' + n + '</option>').join('');
    el.value = CUR_LANG;
  });
}

function setLanguage(v) {
  if (!I18N[v]) v = 'en';
  CUR_LANG = v;
  try { localStorage.setItem('mhd_lang', v); } catch (e) {}
  fillLangSelects();
  applyStaticI18N();
  if (typeof ME !== 'undefined' && ME) {
    db.collection('users').doc(ME.id).update({ language: v }).catch(() => {});
    buildNav();
    if (CURRENT_PAGE) go(CURRENT_PAGE, { silent: true });
    const gEl = document.getElementById('dGreet');
    if (gEl && ROLE === 'patient') {
      const h = new Date().getHours();
      gEl.textContent = (h < 12 ? t('greetM') : h < 17 ? t('greetA') : t('greetE')) + ', ' + ME.name + ' 👋';
    }
  }
  toast('🌐 Language updated ✅');
}

/* One delegated listener — works on login page and inside the app */
document.addEventListener('change', e => {
  const id = e.target && e.target.id;
  if (id === 'langSel' || id === 'langSelAuth' || id === 'setLang') setLanguage(e.target.value);
});

function initLangUI() { fillLangSelects(); applyStaticI18N(); }
fillLangSelects();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLangUI);
else initLangUI();

/* Runtime-rendered portal content is re-translated via a debounced observer
 * so every page, modal, tab and notification stays in the selected language. */
let i18nRefreshTimer = null;
const i18nObserver = new MutationObserver(() => {
  clearTimeout(i18nRefreshTimer);
  i18nRefreshTimer = setTimeout(applyStaticI18N, 0);
});
if (document.body) i18nObserver.observe(document.body, { childList: true, subtree: true });
else document.addEventListener('DOMContentLoaded', () => i18nObserver.observe(document.body, { childList: true, subtree: true }), { once: true });
