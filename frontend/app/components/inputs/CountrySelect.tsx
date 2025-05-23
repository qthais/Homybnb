'use client'
import useCountries from '@/app/hooks/useCountries';
import Image from 'next/image';
import React from 'react'
import Select from 'react-select';
export type CountrySelectValue={
    flag:string;
    label:string;
    latlng:number[];
    region:string;
    value:string;
}
interface CountrySelectProps{
    value?:CountrySelectValue,
    onChange:(value:CountrySelectValue)=>void
}
const CountrySelect:React.FC<CountrySelectProps> = ({
    value,
    onChange
}) => {
    const {getAll}=useCountries()
  return (
    <div>
        <Select
        classNames={{
            control:()=>'p-3 border-2',
            input:()=>'text-lg',
            option:()=>'text-lg'
        }}
        theme={(theme)=>({
            ...theme,
            borderRadius:6,
            colors:{
                ...theme.colors,
                primary25:'#ffe4e6'
            }
        })}
        placeholder="Anywhere"
        isClearable
        options={getAll()}
        value={value}
        onChange={(value)=>onChange(value as CountrySelectValue)}
        formatOptionLabel={(option:any)=>(
            <div className='flex flex-row items-center gap-3'>
                <Image width={32} height={32} src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${option.value}.svg`} alt="" />
                {/* <div>{option.flag}</div> */}
                <div>
                    {option.label},
                    <span className='text-neutral-500 ml-1'>{option.region}</span>
                    </div>
            </div>
        )}
        />
    </div>
  )
}

export default CountrySelect