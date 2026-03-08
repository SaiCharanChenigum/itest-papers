import { Button } from "@/components/ui/Button"
import { Lock } from "lucide-react"
import Link from "next/link"
import { NavButton } from "@/components/ui/NavButton"

export default function ContentLockOverlay() {
    return (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm border border-teal-100">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                    <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Premium Content</h3>
                <p className="text-sm text-slate-600 mb-6">
                    Upgrade to a premium plan to access our complete library of high-quality study materials.
                </p>
                <NavButton href="/pricing" className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold border-0 shadow-lg shadow-orange-500/20">
                    Unlock Full Access
                </NavButton>
            </div>
        </div>
    )
}
