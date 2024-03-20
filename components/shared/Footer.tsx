import { navLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer>
      <div className="logo-div">
        <Image
          src="/assets/images/imaginarium_logo.png"
          width={250}
          height={70}
          alt="logo"
          className="w-full"
        />
      </div>
      <div className="wrapper">
        <div className="links-container">
          <div className="links">
            <h3>Quick Links</h3>
            <ul>
              {navLinks.slice(0, 6).map((link) => {
                return (
                  <li key={link.route} className="">
                    <Link href={link.route}>{link.label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="links">
            <h3>Contact Us</h3>
            <ul>
              <li>schodya@gmail.com</li>
            </ul>
          </div>
        </div>

        <p className="copyright text-center">
          This website is developed by Anatolii Karpov © 2024
        </p>
      </div>
    </footer>
  );
};

export default Footer;
