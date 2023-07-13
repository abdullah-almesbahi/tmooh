var app = angular.module('ace.Constant', [])
    .constant('GENERAL_CONFIG', {
        'api_url': '/',
        // 'api_url': 'http://18.184.10.189/',
        // 'api_url': 'https://tmooh.com/',
        // 'api_url': 'http://192.168.1.130/',
        'preferredLanguage': 'ar',
    })
    .constant('ImgLazyLoad', {
        'AnimateVisible': "true",
        'AnimateSpeed': '0.3s'
    })
    .constant('ManageCoursePrivacy', {
        'Public': 1,
        'Private': 2,
        'Protected': 3
    })
    .constant('AnnouncementType', {
        'Educational': 'Announcement',
        'Promotional': 'Promotion'
    })
    .constant('CourseUserStatus', {
        'Completed': 4,
        'Not started': 2,
        'In progress': 3,
        'In archived': 5
    })
    .constant('RefundDays', {
        'vedio': 29,
        'Offline': 4,
        'Webinar': 4,
    })
    .constant('PlateForm', {
        'Web': 1,
        'iOS': 2,
        'Android': 3,
        'Mobile': 4
    })
    .constant('ConstApiClient', {
        'Approved': 1,
        'Rejected': 2,
        'Pending': 0,
    })
    .constant('ConstToolTipContent', {
        'Announcement': 'سيتم تعطيل الدورات التي وصلت إلى حد الإعلان الشهري بسبب انتهاك سياسة الاستخدام. سيؤدي ذلك إلى عدم ظهور الدورة التدريبية لنتائج البحث أدناه.',
        'DemoExpired': 'Unfortunately, the session has expired. You cannot edit this session anymore.',
        'SessionExpired': 'Unfortunately, the session has expired. You cannot edit this session anymore.',
        'MultipleInstructorEditableError': 'آسف! لا يمكنك الوصول إلى إدارة هذه الدورة التدريبية بعد الآن.',
        'CurriculumUpdateError': 'لن يتم عرض أي تغييرات يتم إجراؤها على صفحة المنهج الدراسي حتى يوافق عليها المشرف. حتى ذلك الحين ، ستبقى الدورة مخفية.',
        'PaidCourseAlert': 'قبل تحديد سعر الدورة. يجب أن توافق على الشروط والأحكام الخاصة بالدورة التدريبية المدفوعة',
        'PaidPaypalCourseAlert': 'قبل تحديد سعر الدورة. يجب عليك تأكيد حساب Paypal',
        'RefundInformation': 'Refund option is available only for a certain time period and it varies by the type of course purchased. For Video-based training, a refund can be requested up to 30 days from the date of purchase, for Instructor-led live training and for Onsite training up to 4 classes. Refund button will be disabled after this time period.',
        'UnpublishedAlert': 'تم نقل الدورة إلى وضع غير منشور. تحتاج إلى موافقة المشرف عن طريق النقر فوق زر إرسال للمراجعة',
        'EmailChangeAlert': 'إذا قمت بتغيير عنوان بريدك الإلكتروني. سيتم اخراجك تلقائيا من الموقع. تحتاج إلى تسجيل الدخول باستخدام عنوان البريد الإلكتروني الذي تم تغييره مؤخرًا',
        'PayPalPaymentInfo': 'الرجاء النقر فوق الزر "تسجيل الدخول" ا لربط حساب PayPal الخاص بك'
    })
    .constant('ConstDateFormat', {
        created: 'yyyy-MM-dd',
        created_24: 'yyyy-MM-dd HH:mm',
        created_24_z: 'yyyy-MM-dd HH:mm Z',
        medium_created_24: 'dd MMM yyyy H:mm:ss',
        created_12: 'dd MMM yyyy hh:mm a',
        created_12_z: 'yyyy-MM-dd hh:mma Z',
        mediumDate: 'dd MMM yyyy',
        time_sec_24: 'HH:mm:ss',
        time_sec_12: 'hh:mm a'
    })
    // Do not change the key of the courseType.But you can change the value..
    .constant('CourseType', {
        'all': null,
        'video': 1,
        'onsite': 2,
        'online': 3,
    })
    .constant('ConstTimeZoneConversion', {
        'UserTimezoneConversion': 1,
    })
    .constant('ConstBirthdayYearAgo', {
        'yearago': 14,
    })
    .constant('ConstPaymentMode', {
        'payment_type1': 'Credit Card',
        'payment_type2': 'PayPal',
    })
    .constant('ConstCourseType', {
        'online': 'Instructor-led Live Online Training',
        'onsite': 'Instructor-led Live Onsite Training',
        'video': 'Video Based Training',
    })
    .constant('ConstProfileSocialLink', {
        'facebook': 'http://www.facebook.com/',
        'twitter': 'http://twitter.com/',
        'google': 'https://plus.google.com/',
        'youtube': 'http://www.youtube.com/',
        'linkedin': 'http://www.linkedin.com/',
    }) .constant('ConstCurrencies', {
        'Default': '$',
    });
