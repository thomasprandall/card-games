import { MouseEventHandler } from "react"

export const Button = function({label, actionFn, disabled = false}: {label: string, actionFn: MouseEventHandler, disabled:boolean}){
    return (
        <button className="border-2 px-4 py-2 rounded bg-green-600 disabled:bg-slate-500" onClick={actionFn} disabled={disabled}>{label}</button>
    )
}