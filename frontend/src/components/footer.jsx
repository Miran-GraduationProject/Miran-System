
"use client";

import {
  Footer,
  FooterBrand,
  FooterCopyright,
  FooterDivider,
  FooterIcon,
  FooterLink,
  FooterLinkGroup,
  FooterTitle,
} from "flowbite-react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
import logo from "../assets/logo3.png";

 function FooterComponent() {
  return (
   <footer
  dir="rtl"
  className="bg-gradient-to-t from-emerald-900 via-emerald-800 to-emerald-700 text-white rounded-t-3xl w-full px-12 md:px-24 py-12 mx-4 md:mx-20 pr-6 md:pr-12"
>
  <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center"> 
    <div className="w-full flex flex-col md:flex-row justify-start items-center md:items-center gap-12 md:gap-50 pr-10 md:pr-20 ">
          <div className="w-full flex flex-col md:flex-row justify-start items-start md:items-center gap-12 md:gap-20 pr-12 md:pr-24">
              <img src={logo} className="object-contain h-20 w-20 " alt="Flowbite Logo" />
          </div>
          <div className="grid  items-center justify-center grid-cols-2 gap-4 sm:mt-4 sm:grid-cols-3 sm:gap-6 min-h-60 w-full md:max-w-xl">
            <div>
              <FooterTitle title="عن مِران :" />
              <FooterLinkGroup col>
                <FooterLink href="#">من نحن</FooterLink>
                <FooterLink href="#">الخدمات</FooterLink>
              </FooterLinkGroup>
            </div>
            <div>
              <FooterTitle title=" الاحكام :" />
              <FooterLinkGroup col>
                <FooterLink href="#">سياسة الخصوصية</FooterLink>
                <FooterLink href="#">الشروط والاحكام</FooterLink>
              </FooterLinkGroup>
            </div>
          
          </div>
        </div>
        <FooterDivider />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <FooterCopyright href="#" by="Flowbite™" year={2022} />
          <div className="mt-4 flex gap-6 sm:mt-0 sm:justify-center">
            <FooterIcon href="#" icon={BsFacebook} />
            <FooterIcon href="#" icon={BsInstagram} />
            <FooterIcon href="#" icon={BsTwitter} />
            <FooterIcon href="#" icon={BsGithub} />
            <FooterIcon href="#" icon={BsDribbble} />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterComponent;