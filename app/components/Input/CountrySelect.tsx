"use client"; // Select Option

import useCountries from "@/app/hooks/useCountries";
import Select from "react-select";

export type CountrySelectValue = {
    flag: string,
    label: string,
    latlng: number[],
    region: string,
    value: string
}

interface CountrySelectProps {
    value?: CountrySelectValue;
    onChang: (value: CountrySelectValue) => void;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
    value,
    onChang
}) => {
    const { getAll } = useCountries();
    return (
        <div>
            <Select
                placeholder="任何地方"
                isClearable
                options={getAll()}
                value={value}
                onChange={(value) => onChang(value as CountrySelectValue)}
                formatOptionLabel={(option: any) => (
                    <div className="flex flex-row items-center gap-3">
                        <div>{option.flag}</div>
                            <div>
                                {option.label},
                                <span className="text-neutral-500 ml-1">
                                    {option.region}
                                </span>
                            </div>
                        </div>
                )}
                classNames={{
                    control: () => 'p-3 border-2',
                    input: () => 'text-lg',
                    option: () => 'text-lg'
                }}
                theme={(theme) => ({
                    ...theme,
                    borderRadius: 6,
                    colors: {
                        ...theme.colors,
                        primary: 'black',
                        primary25: '#ffe4e6'
                    }
                })}
            />
        </div>
    );
}

export default CountrySelect;