"use client"; // Select Option

import useRegions from "@/app/hooks/useRegions";
import Select from "react-select";

export type RegionSelectValue = {
    label: string,
    latlng: readonly number[],
    region: string,
    value: string
}

interface RegionSelectProps {
    value?: RegionSelectValue;
    onChang: (value: RegionSelectValue) => void;
}

const RegionSelect: React.FC<RegionSelectProps> = ({
    value,
    onChang
}) => {
    const { getAll } = useRegions();
    return (
        <div>
            <Select
                placeholder="任何地方"
                isClearable
                options={getAll()}
                value={value}
                onChange={(value) => onChang(value as RegionSelectValue)}
                formatOptionLabel={(option: RegionSelectValue) => (
                    <div className="flex flex-row items-center gap-3">
                        <div>
                            {option.label}
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
                        primary25: '#d1fae5'
                    }
                })}
            />
        </div>
    );
}

export default RegionSelect;
