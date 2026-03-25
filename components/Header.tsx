"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { authUtils } from "@/lib/localdata";
import { User } from "@prisma/client";

interface Headerelements {
   user: User
}
export function Header({ user }: Headerelements) {
   const router = useRouter();
   if (user){
return (
    
    <header>
        <h1>Bekam</h1>
        <img src={user.imgUrl||""}/>
        <span style={{ cursor: "pointer", color: "blue" }} onClick={() => {
            authUtils.clearId();
            router.replace("/login");
        }}>
          Logout
        </span>
    </header> 
)
   }
   else{
    return (<header><h1>Bekam</h1></header>)
   }
}