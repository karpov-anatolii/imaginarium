"use client";

import { Button } from "@/components/ui/button";
import { createUser } from "@/lib/actions/user.actions";
import { UserButton } from "@clerk/nextjs";
import { log } from "console";
import React from "react";

const Home = () => {
  return (
    <div>
      <p>Home</p>
    </div>
  );
};

export default Home;
