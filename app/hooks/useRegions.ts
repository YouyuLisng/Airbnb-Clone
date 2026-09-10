// Taiwan's 22 counties/cities (縣市), grouped by region, with an
// approximate center coordinate for each -- used as the pickup-location
// picker instead of a country selector, since gear pickup is inherently
// local. Replaces the tutorial's world-countries-based useCountries.
const TAIWAN_REGIONS = [
    { value: 'TPE', label: '台北市', region: '北部', latlng: [25.0330, 121.5654] },
    { value: 'NTP', label: '新北市', region: '北部', latlng: [25.0169, 121.4627] },
    { value: 'KEE', label: '基隆市', region: '北部', latlng: [25.1276, 121.7392] },
    { value: 'TAO', label: '桃園市', region: '北部', latlng: [24.9936, 121.3010] },
    { value: 'HSZ', label: '新竹市', region: '北部', latlng: [24.8138, 120.9675] },
    { value: 'HSQ', label: '新竹縣', region: '北部', latlng: [24.8388, 121.0178] },
    { value: 'ILA', label: '宜蘭縣', region: '北部', latlng: [24.7021, 121.7377] },
    { value: 'TXG', label: '台中市', region: '中部', latlng: [24.1477, 120.6736] },
    { value: 'MIA', label: '苗栗縣', region: '中部', latlng: [24.5602, 120.8214] },
    { value: 'CHA', label: '彰化縣', region: '中部', latlng: [24.0518, 120.5161] },
    { value: 'NAN', label: '南投縣', region: '中部', latlng: [23.9609, 120.9718] },
    { value: 'YUN', label: '雲林縣', region: '中部', latlng: [23.7092, 120.4313] },
    { value: 'TNN', label: '台南市', region: '南部', latlng: [22.9997, 120.2270] },
    { value: 'KHH', label: '高雄市', region: '南部', latlng: [22.6273, 120.3014] },
    { value: 'CYI', label: '嘉義市', region: '南部', latlng: [23.4801, 120.4491] },
    { value: 'CYQ', label: '嘉義縣', region: '南部', latlng: [23.4518, 120.2555] },
    { value: 'PIF', label: '屏東縣', region: '南部', latlng: [22.5519, 120.5487] },
    { value: 'HUA', label: '花蓮縣', region: '東部', latlng: [23.9871, 121.6015] },
    { value: 'TTT', label: '台東縣', region: '東部', latlng: [22.7972, 121.1444] },
    { value: 'PEN', label: '澎湖縣', region: '離島', latlng: [23.5711, 119.5793] },
    { value: 'KIN', label: '金門縣', region: '離島', latlng: [24.4491, 118.3767] },
    { value: 'LIE', label: '連江縣', region: '離島', latlng: [26.1608, 119.9291] },
] as const;

const useRegions = () => {
    const getAll = () => TAIWAN_REGIONS;

    const getByValue = (value: string) => {
        return TAIWAN_REGIONS.find((item) => item.value === value);
    }

    return {
        getAll,
        getByValue
    }
};

export default useRegions;
