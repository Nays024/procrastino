const body=document.body;
const themeToggle=document.getElementById("themeToggle");
const languageToggle=document.getElementById("languageToggle");
const themeText=document.getElementById("themeText");
const STORAGE="procrastino-completed";
let currentLanguage=localStorage.getItem("procrastino-language")||"es";
let darkMode=localStorage.getItem("procrastino-dark")==="true";
const totalLessons=10;
function completedSet() {
    try {
        return new Set(JSON.parse(localStorage.getItem(STORAGE)||"[]"))
    } catch (e) {
        return new Set()
    }
}
function saveCompleted(set) {
    localStorage.setItem(STORAGE,JSON.stringify([...set]))
}
function applyLanguage() {
    document.documentElement.lang=currentLanguage;
    document.querySelectorAll("[data-es][data-en]").forEach(el=> {
        el.innerHTML=el.dataset[currentLanguage]
    }
    );
    document.querySelectorAll("[data-placeholder-es][data-placeholder-en]").forEach(el=>el.placeholder=el.getAttribute(`data-placeholder-${currentLanguage}`));
    document.querySelectorAll("[data-alt-es][data-alt-en]").forEach(el=>el.alt=el.getAttribute(`data-alt-${currentLanguage}`));
    document.querySelectorAll("[data-src-es][data-src-en]").forEach(el=>el.src=el.getAttribute(`data-src-${currentLanguage}`));
    if(languageToggle)languageToggle.textContent=currentLanguage.toUpperCase();
    document.title=document.body.dataset[`title-${currentLanguage}`]||document.title
}
function applyTheme() {
    body.classList.toggle("dark",darkMode);
    if(themeText)themeText.textContent=darkMode?(currentLanguage==="es"?"Modo claro":"Light mode"):(currentLanguage==="es"?"Modo oscuro":"Dark mode")
}
function updateProgress() {
    const set=completedSet();
    const done=set.size;
    const pct=Math.round(done/totalLessons*100);
    document.querySelectorAll("[data-progress-percent]").forEach(el=>el.textContent=`${pct}%`);
    document.querySelectorAll("[data-progress-bar]").forEach(el=> {
        el.setAttribute("aria-valuenow",pct);
        const fill=el.querySelector(".progress-fill");
        if(fill)fill.style.width=`${pct}%`
    }
    );
    document.querySelectorAll("[data-module-progress]").forEach(el=> {
        const ids=(el.dataset.ids||"").split(",").filter(Boolean);
        const n=ids.filter(id=>set.has(id)).length;
        el.textContent=`${n}/${ids.length}`
    }
    );
    document.querySelectorAll("[data-mini-fill]").forEach(el=> {
        const ids=(el.dataset.ids||"").split(",").filter(Boolean);
        const n=ids.filter(id=>set.has(id)).length;
        el.style.width=`${ids.length?n/ids.length*100:0}%`
    }
    );
    const lesson=document.body.dataset.lesson;
    if(lesson) {
        const btn=document.querySelector("[data-complete]");
        if(btn) {
            const doneNow=set.has(lesson);
            btn.classList.toggle("done",doneNow);
            btn.innerHTML=doneNow?(currentLanguage==="es"?"✓ Pantalla completada":"✓ Screen completed"):(currentLanguage==="es"?"Marcar pantalla como completada":"Mark screen as complete")
        }
    }
}
if(languageToggle)languageToggle.addEventListener("click",()=> {
    currentLanguage=currentLanguage==="es"?"en":"es";
    localStorage.setItem("procrastino-language",currentLanguage);
    applyLanguage();
    applyTheme();
    updateProgress()
}
);
if(themeToggle)themeToggle.addEventListener("click",()=> {
    darkMode=!darkMode;
    localStorage.setItem("procrastino-dark",darkMode);
    applyTheme()
}
);
const complete=document.querySelector("[data-complete]");
if(complete)complete.addEventListener("click",()=> {
    const id=document.body.dataset.lesson;
    if(!id)return;
    const set=completedSet();
    if(set.has(id))set.delete(id);
    else set.add(id);
    saveCompleted(set);
    updateProgress()
}
);
document.querySelectorAll("[data-quiz]").forEach(quiz=> {
    quiz.querySelectorAll(".quiz-option").forEach(btn=>btn.addEventListener("click",()=> {
        quiz.querySelectorAll(".quiz-option").forEach(b=>b.classList.remove("correct","incorrect"));
        const ok=btn.dataset.correct==="true";
        btn.classList.add(ok?"correct":"incorrect");
        const f=quiz.querySelector(".feedback");
        if(f)f.textContent=ok?(currentLanguage==="es"?"✓ Correcto. Buena decisión.":"✓ Correct. Good choice."):(currentLanguage==="es"?"✗ Revisa la idea y prueba de nuevo.":"✗ Review the idea and try again.")
    }
    ))
}
);
const timer=document.querySelector("[data-timer]");
if(timer) {
    let seconds=1500,interval=null;
    const display=timer.querySelector("[data-time]");
    const render=()=> {
        const m=Math.floor(seconds/60),s=seconds%60;
        display.textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
    }
    ;
    timer.querySelector("[data-start]")?.addEventListener("click",()=> {
        if(interval)return;
        interval=setInterval(()=> {
            if(seconds>0) {
                seconds--;
                render()
            } else {
                clearInterval(interval);
                interval=null
            }
        }
        ,1000)
    }
    );
    timer.querySelector("[data-pause]")?.addEventListener("click",()=> {
        clearInterval(interval);
        interval=null
    }
    );
    timer.querySelector("[data-reset]")?.addEventListener("click",()=> {
        clearInterval(interval);
        interval=null;
        seconds=1500;
        render()
    }
    );
    render()
}
document.querySelectorAll(".checklist").forEach(list=> {
    const checks=[...list.querySelectorAll('input[type="checkbox"]')];
    const countEl=list.parentElement.querySelector("[data-check-count]");
    const update=()=> {
        if(countEl)countEl.textContent=checks.filter(c=>c.checked).length
    }
    ;
    checks.forEach(c=>c.addEventListener("change",update));
    update()
}
);
const goalForm=document.querySelector("[data-goal-form]");
if(goalForm) {
    goalForm.addEventListener("submit",e=> {
        e.preventDefault();
        const data=new FormData(goalForm);
        const result=document.querySelector("[data-goal-result]");
        const goal=data.get("goal"),step=data.get("step"),review=data.get("review");
        result.hidden=false;
        result.innerHTML=currentLanguage==="es"?`<strong>Tu plan:</strong><br>Meta: ${goal}<br>Siguiente paso: ${step}<br>Revisión: ${review}`:`<strong>Your plan:</strong><br>Goal: ${goal}<br>Next step: ${step}<br>Review: ${review}`
    }
    )
}
applyLanguage();
applyTheme();
updateProgress();
