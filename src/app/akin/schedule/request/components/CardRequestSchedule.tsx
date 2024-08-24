import React from 'react';
import Image from 'next/image';
import Primary from '@/components/button/primary';

export default function CardRequestSchdule() {
    return (
        <div className="card shadow-lg text-center rounded-lg flex items-center justify-content-center bg-slate-200 flex-col">
          <div className='p-4'> <img className='rounded-full' src="https://github.com/OsapiCare.png" width={200} height={200} alt=''/></div>
            <div className='text-center flex flex-col mt-1'>
                <h1 className='text-2xl font-bold text-cyan-800'>Paciencia Anibal</h1>
                <span className='font-semibold text-cyan-800'>Sexo: Masculino</span>
                <span className='font-semibold text-cyan-800'>Idade: 25</span>
                <span className='font-semibold text-cyan-800'>Data: 25/05/2025</span>
                <span className='font-semibold text-cyan-800'>Hora: 13:30</span>
            </div>
            <div className='w-full mt-1'>
                <Primary className='w-full flex justify-center bg-green-800 text-white text-center font-semibold rounded-t-none'>Pesquisa de Plasmódio</Primary>
            </div>
         </div>
    )
}
 