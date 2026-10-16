import { VideoTrack } from '../types';

export const PRESET_VIDEOS: VideoTrack[] = [
  {
    id: 'cyberpunk-city',
    title: 'مدينة المستقبل والنيون (Cyberpunk Neo-Tokyo)',
    category: 'خيال علمي وتكنولوجيا',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    duration: '12:14',
    resolution: '4K / 60 FPS',
    description: 'مشاهد مستقبلية ساحرة تمزج بين الخيال العلمي المذهل والمؤثرات البصرية الفائقة.'
  },
  {
    id: 'nature-waterfalls',
    title: 'عظمة الطبيعة الخلابة وشلالات إيغوازو',
    category: 'استرخاء وطبيعة',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    duration: '09:56',
    resolution: '1080p FHD',
    description: 'تدفق مياه الشلالات بين الغابات الاستوائية والطيور المغردة لصفاء الذهن التام.'
  },
  {
    id: 'lofi-beats-chill',
    title: 'أجواء لوفاي هادئة للمذاكرة والتركيز العميق',
    category: 'لوفاي وتركيز',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    duration: '10:53',
    resolution: '1080p FHD',
    description: 'رسومات متحركة دافئة مصحوبة بإيقاعات لوفاي مريحة تعزز التركيز والإنتاجية.'
  },
  {
    id: 'deep-ocean-jellyfish',
    title: 'عالم أعماق المحيط وقناديل البحر المتوهجة',
    category: 'كائنات حية وعجائب',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    duration: '00:15',
    resolution: '4K Ultra',
    description: 'كائنات بحرية مضيئة حيوياً تسبح في ظلمات المحيط بحركات انسيابية تسلب الألباب.'
  },
  {
    id: 'cosmos-galaxy-timelapse',
    title: 'درب التبانة وحركة النجوم عبر الأفق',
    category: 'فضاء وفلك',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    duration: '00:15',
    resolution: '1080p 60fps',
    description: 'تسارع زمني مهيب لدوران القبة السماوية وأذرع مجرة درب التبانة في سماء الصحراء.'
  },
  {
    id: 'super-speed-action',
    title: 'اختبار معدل الإطارات والسرعة الفائقة',
    category: 'أكشن وحركة',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    duration: '00:47',
    resolution: 'FHD Smooth',
    description: 'سباق سيارات سريع لاختبار قدرة شاشتك ومعالجك على عرض الحركات السريعة بسلاسة.'
  }
];
