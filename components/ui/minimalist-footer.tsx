"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, ArrowUpRight } from "lucide-react"
import { motion } from "motion/react"

export function MinimalistFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: "Ana Sayfa", href: "/" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Duyurular", href: "/duyurular" },
    { label: "Sosyal Gruplar", href: "/sosyal-gruplar" },
  ]

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
  ]

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Section - Spans 5 columns */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-gray-900 font-quicksand">
                lokal<span className="text-[#0015ff]">.</span>
              </h3>
            </Link>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-sm">
              Yerel toplulukları güçlendirmek ve insanları bir araya getirmek için buradayız.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#0015ff] hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links - Spans 3 columns */}
          <div className="md:col-span-3">
            <h4 className="font-semibold text-gray-900 mb-4">Hızlı Erişim</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-[#0015ff] transition-colors duration-200 inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Spans 4 columns */}
          <div className="md:col-span-4">
            <h4 className="font-semibold text-gray-900 mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:lokalkahvesi@gmail.com"
                  className="text-gray-600 hover:text-[#0015ff] transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  lokalkahvesi@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+905334370266"
                  className="text-gray-600 hover:text-[#0015ff] transition-colors duration-200 inline-flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +90 533 437 02 66
                </a>
              </li>
              <li className="text-gray-600 inline-flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  Hürriyet Mh. Öğretmenler Cd.
                  Aka Koleji Karşısı, Süleymanpaşa/Tekirdağ
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Lokal. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="#"
                className="text-gray-500 hover:text-[#0015ff] transition-colors duration-200"
              >
                Gizlilik Politikası
              </Link>
              <Link
                href="#"
                className="text-gray-500 hover:text-[#0015ff] transition-colors duration-200"
              >
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}