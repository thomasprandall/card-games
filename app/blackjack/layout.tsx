export default function BlackjackLayout({
    children
}: {children: React.ReactNode}){
    return (
        <section className="w-full">
            <div>
                {children}
            </div>
        </section>
    )
}