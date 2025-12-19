const Navbar = () => {
  return (
    <header className="h-16 bg-primary border-b border-primary/20 flex items-center px-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center gap-3">
        
        {/* 1. Logo Image (CG.png) */}
        <img 
          src="/CG_Logo_white 1.svg" 
          alt="P2SD Logo" 
          className="w-17 h-9 object-contain" 
        />
        
        {/* 2. Vertical Bar Separator */}
        <div className="text-3xl font-light text-primary-foreground pr-1">|</div> 
        
        {/* 3. Text Content */}
        <div>
          <h1 className="text-2xl font-bold text-primary-foreground">P2SD</h1>
          <p className="text-xs text-secondary font-medium tracking-wide">
            Predict • Prevent • Sustain • Detect
          </p>
        </div>
      </div>
    </header>
  );
};

export default Navbar;