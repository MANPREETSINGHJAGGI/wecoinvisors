"use client";

import { useEffect, useState } from "react";

type Props = {
  provider: string;
};

export default function LiveMarketData({ provider }: Props) {
  console.log("Provider:", provider); // ✅ TEMPORARY usage to satisfy TypeScript
