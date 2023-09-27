
import countries from "world-countries"; // 國家資料

const formattedCountries = countries.map((country) => ({
    value: country.cca2,
    label: country.name.common,
    flag: country.flag,
    latlng: country.latlng,
    region: country.region
}));

const useCountries = () => {
    // 取全部
    const getAll = () => formattedCountries;
    // 篩選
    const getByValue =(value: string) => {
        return formattedCountries.find((item) => item.value === value);
    }

    return {
        getAll,
        getByValue
    }
};

export default useCountries;