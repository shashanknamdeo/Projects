import React from 'react';

const MeshBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-950">
            {/* Soft, professional dark gradients */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-indigo-900/10 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-900/20 blur-[120px] rounded-full -translate-x-1/4 translate-y-1/4" />
        </div>
    );
};

export default MeshBackground;
