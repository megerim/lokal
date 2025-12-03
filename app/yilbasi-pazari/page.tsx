"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Gift, ShoppingBag, Star, Music, Coffee, Sparkles, TreePine, Heart, Users, ChevronDown, LogIn, Snowflake } from "lucide-react"
import { MarketApplicationForm } from "@/components/christmas/market-application-form"
import { useAuth } from "@/components/auth/auth-context"
import Link from "next/link"
import Image from "next/image"

export default function ChristmasMarketPage() {
    const [isApplicationOpen, setIsApplicationOpen] = useState(false)
    const { user } = useAuth()

    const snowflakes = useMemo(() =>
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 10 + Math.random() * 10,
            size: 12 + Math.random() * 12,
        })), []
    )

    const handleApplicationClick = () => {
        if (user) {
            setIsApplicationOpen(true)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-red-950 to-green-950">
            {/* Hero Section */}
            <div className="relative h-screen overflow-hidden flex items-center justify-center">
                {/* Decorative Elements - Hidden on mobile */}
                <div className="absolute top-10 left-10 opacity-20 hidden sm:block">
                    <TreePine className="w-16 md:w-24 lg:w-32 h-16 md:h-24 lg:h-32 text-green-400" />
                </div>
                <div className="absolute top-20 right-8 md:right-16 opacity-20 hidden sm:block">
                    <TreePine className="w-12 md:w-20 lg:w-24 h-12 md:h-20 lg:h-24 text-green-400" />
                </div>
                <div className="absolute bottom-32 left-8 md:left-20 opacity-20 hidden sm:block">
                    <Gift className="w-12 md:w-16 lg:w-20 h-12 md:h-16 lg:h-20 text-red-400" />
                </div>
                <div className="absolute bottom-40 right-8 md:right-24 opacity-20 hidden sm:block">
                    <Star className="w-10 md:w-12 lg:w-16 h-10 md:h-12 lg:h-16 text-yellow-400 fill-yellow-400" />
                </div>

                {/* Snowfall Animation */}
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                    {snowflakes.map((flake) => (
                        <motion.div
                            key={flake.id}
                            className="absolute text-blue-300/60"
                            style={{
                                left: flake.left,
                            }}
                            initial={{ top: -20, opacity: 0 }}
                            animate={{
                                top: "100%",
                                opacity: [0, 1, 1, 0],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: flake.duration,
                                delay: flake.delay,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <Snowflake size={flake.size} />
                        </motion.div>
                    ))}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 z-10" />

                {/* Christmas Lights Effect */}
                <div className="absolute top-2 left-0 right-0 h-4 flex justify-around items-center overflow-visible z-30">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 sm:w-3 sm:h-3 rounded-full shadow-lg"
                            style={{
                                backgroundColor: ['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#ec4899'][i % 5],
                                boxShadow: `0 0 10px ${['#ef4444', '#22c55e', '#eab308', '#3b82f6', '#ec4899'][i % 5]}`,
                            }}
                            animate={{
                                opacity: [0.4, 1, 0.4],
                                scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{
                                duration: 1.5,
                                delay: i * 0.1,
                                repeat: Infinity,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center text-white">
                    <motion.div
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {/* Main Title with Decorations */}
                        <div className="relative inline-block px-4">
                            <motion.div
                                className="absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 hidden md:block"
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <span className="text-4xl lg:text-6xl">🎄</span>
                            </motion.div>

                            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 pb-2 font-quicksand bg-gradient-to-r from-red-200 via-white to-green-200 bg-clip-text text-transparent drop-shadow-2xl">
                                Yılbaşı Pazarı
                            </h1>

                            <motion.div
                                className="absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 hidden md:block"
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            >
                                <span className="text-4xl lg:text-6xl">🎁</span>
                            </motion.div>
                        </div>

                        <motion.p
                            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 font-light leading-relaxed px-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            Yılın en güzel günü bir araya geldiğimiz gün
                            <br className="hidden md:block" />
                            <span className="text-yellow-300 font-medium">#lokalbiryeniyılpazarı</span>
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4 sm:px-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            {user ? (
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-full shadow-xl shadow-red-500/30 font-semibold group"
                                    onClick={handleApplicationClick}
                                >
                                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce" />
                                    Stant Başvurusu Yap
                                </Button>
                            ) : (
                                <Link href="/auth?redirect=/yilbasi-pazari">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-full shadow-xl shadow-red-500/30 font-semibold group"
                                    >
                                        <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                        Başvurmak için Giriş Yap
                                    </Button>
                                </Link>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6 rounded-full"
                                onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Detayları İncele
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 ml-2 animate-bounce" />
                            </Button>
                        </motion.div>

                        {/* Quick Info Pills */}
                        <motion.div
                            className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 mt-8 sm:mt-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                                <span>28-29 Aralık</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                                <span>Süleymanpaşa, Tekirdağ</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator - Hidden on very small screens */}
                <motion.div
                    className="absolute bottom-20 sm:bottom-28 md:bottom-36 left-1/2 -translate-x-1/2 z-20 hidden sm:block"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
                        <div className="w-1 h-2 sm:w-1.5 sm:h-3 bg-white/50 rounded-full" />
                    </div>
                </motion.div>

                {/* Wavy Divider */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                    <svg
                        viewBox="0 0 1440 120"
                        className="w-full h-12 sm:h-16 md:h-20 block"
                        preserveAspectRatio="none"
                        fill="none"
                    >
                        <path
                            d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z"
                            className="fill-red-950/80"
                        />
                        <path
                            d="M0,80 C240,120 480,40 720,80 C960,120 1200,40 1440,80 L1440,120 L0,120 Z"
                            className="fill-red-950"
                        />
                    </svg>
                </div>
            </div>

            {/* Details Section */}
            <div id="details" className="relative bg-red-950">
                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 md:mb-24">
                        {[
                            {
                                icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
                                title: "Tarih",
                                desc: "28-29 Aralık 2024",
                                subdesc: "Cumartesi - Pazar",
                                color: "from-red-500 to-red-600",
                                bgColor: "bg-red-500/10",
                            },
                            {
                                icon: <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />,
                                title: "Lokasyon",
                                desc: "Lokal Cafe, Hürriyet Mh. Öğretmenler Cd.",
                                subdesc: "Aka Koleji Karşısı, Süleymanpaşa/Tekirdağ",
                                color: "from-green-500 to-green-600",
                                bgColor: "bg-green-500/10",
                            },
                            {
                                icon: <Gift className="w-6 h-6 sm:w-8 sm:h-8" />,
                                title: "Konsept",
                                desc: "El Yapımı Ürünler",
                                subdesc: "Tasarım Hediyelikler",
                                color: "from-yellow-500 to-amber-600",
                                bgColor: "bg-yellow-500/10",
                            }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                                viewport={{ once: true }}
                            >
                                <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300 group overflow-hidden">
                                    <CardContent className="p-5 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4 relative">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 ${card.bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-white group-hover:scale-110 transition-transform`}>
                                            {card.icon}
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white">{card.title}</h3>
                                        <div className="text-white/80">
                                            <p className="font-medium text-sm sm:text-base">{card.desc}</p>
                                            <p className="text-xs sm:text-sm text-white/60">{card.subdesc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Features Section */}
                    <div className="mb-12 sm:mb-16 md:mb-24">
                        <motion.div
                            className="text-center mb-8 sm:mb-12 md:mb-16"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block text-3xl sm:text-4xl mb-3 sm:mb-4">✨</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Sizi Neler Bekliyor?</h2>
                            <p className="text-white/60 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-4">
                                Noel baba, oyunlar, yemek standları ve daha birçok sürpriz! Güncellemeleri Instagram hesabımızdan takip edebilirsiniz.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                            {[
                                {
                                    icon: <ShoppingBag className="w-7 h-7" />,
                                    title: "El Emeği Ürünler",
                                    desc: "Takı, seramik, çanta ve daha fazlası - yerel tasarımcılardan",
                                    emoji: "🛍️",
                                },
                                {
                                    icon: <Coffee className="w-7 h-7" />,
                                    title: "Yemek Standları",
                                    desc: "Lezzetli atıştırmalıklar ve sıcak içeceklerle dolu standlar",
                                    emoji: "🍽️",
                                },
                                {
                                    icon: <Music className="w-7 h-7" />,
                                    title: "Eğlence & Oyunlar",
                                    desc: "Noel baba, müzik ve çocuklar için eğlenceli aktiviteler",
                                    emoji: "🎅",
                                },
                                {
                                    icon: <Gift className="w-7 h-7" />,
                                    title: "Ücretsiz Giriş",
                                    desc: "Misafirlere kapımız açık, pazarımızı ziyaret etmek ücretsiz!",
                                    emoji: "🎁",
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group"
                                >
                                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full hover:transform hover:-translate-y-2">
                                        <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 md:mb-4">{feature.emoji}</div>
                                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2 md:mb-3">{feature.title}</h3>
                                        <p className="text-white/60 text-xs sm:text-sm md:text-base">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Why Join Section */}
                    <motion.div
                        className="bg-gradient-to-r from-red-900/50 to-green-900/50 backdrop-blur-md rounded-2xl sm:rounded-3xl md:rounded-[2rem] p-5 sm:p-8 md:p-12 mb-12 sm:mb-16 md:mb-24 border border-white/10"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div>
                                <span className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 block">🎪</span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">Stant Başvuru Kriterleri</h2>
                                <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
                                    Ürün tercihleri el emeği, hikayesi, doğallığı, sürdürülebilirliği ve yaratıcı unsurları göz önünde bulundurularak yapılacaktır.
                                </p>
                                <ul className="space-y-3 sm:space-y-4">
                                    {[
                                        { icon: <Heart className="w-4 h-4 sm:w-5 sm:h-5" />, text: "El emeği ve özgün tasarımlar" },
                                        { icon: <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Doğal ve sürdürülebilir ürünler" },
                                        { icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Hikayesi olan markalar" },
                                        { icon: <Gift className="w-4 h-4 sm:w-5 sm:h-5" />, text: "Yaratıcı ve özgün konseptler" },
                                    ].map((item, i) => (
                                        <motion.li
                                            key={i}
                                            className="flex items-center gap-3 sm:gap-4 text-white/80"
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center text-red-400 flex-shrink-0">
                                                {item.icon}
                                            </div>
                                            <span className="text-sm sm:text-base md:text-lg">{item.text}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            <div className="relative hidden md:block">
                                <div className="aspect-square rounded-3xl overflow-hidden border-4 border-green-500 shadow-lg shadow-green-500/20">
                                    <Image
                                        src="/christmas/6.webp"
                                        alt="Yılbaşı Pazarı"
                                        fill
                                        className="object-cover rounded-2xl"
                                    />
                                </div>
                                {/* Floating ornaments */}
                                <motion.div
                                    className="absolute -top-4 -right-4 text-3xl lg:text-5xl"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    ⭐
                                </motion.div>
                                <motion.div
                                    className="absolute -bottom-4 -left-4 text-2xl lg:text-4xl"
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity }}
                                >
                                    🎅
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        className="relative overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2rem] bg-gradient-to-r from-red-600 via-red-700 to-green-700 p-6 sm:p-10 md:p-12 lg:p-20 text-center shadow-2xl"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Decorative background elements */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 -left-20 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-20 -right-20 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/10 rounded-full blur-3xl" />
                        </div>

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="inline-block mb-4 sm:mb-6"
                            >
                                <Star className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-400 fill-yellow-400" />
                            </motion.div>

                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                                Stant Açmak İster misiniz?
                            </h2>
                            <p className="text-white/90 mb-6 sm:mb-8 md:mb-10 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed px-2">
                                Kendi tasarımlarınızı ve el emeği ürünlerinizi binlerce ziyaretçiyle buluşturun.
                                <span className="block mt-2 text-yellow-200 font-medium">Sınırlı sayıda kontenjanımız bulunmaktadır!</span>
                            </p>

                            {user ? (
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-white text-red-700 hover:bg-white/90 text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 rounded-full font-bold shadow-xl shadow-black/20 group"
                                    onClick={handleApplicationClick}
                                >
                                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-spin" />
                                    Hemen Başvur
                                </Button>
                            ) : (
                                <Link href="/auth?redirect=/yilbasi-pazari">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-white text-red-700 hover:bg-white/90 text-base sm:text-lg md:text-xl px-8 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 rounded-full font-bold shadow-xl shadow-black/20 group"
                                    >
                                        <LogIn className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                                        Başvurmak için Giriş Yap
                                    </Button>
                                </Link>
                            )}

                            <p className="text-white/60 mt-4 sm:mt-6 text-xs sm:text-sm">
                                {user
                                    ? "Başvurular değerlendirildikten sonra sizinle iletişime geçeceğiz."
                                    : "Başvuru yapabilmek için üye girişi yapmanız gerekmektedir."
                                }
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <MarketApplicationForm
                isOpen={isApplicationOpen}
                onClose={() => setIsApplicationOpen(false)}
            />
        </div>
    )
}
