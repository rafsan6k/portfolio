import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteContentMap {
  [key: string]: string;
}

export const useSiteContent = (section: string) => {
  return useQuery({
    queryKey: ["site_content", section],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("section", section);
      if (error) throw error;
      const map: SiteContentMap = {};
      data?.forEach((row) => {
        map[row.key] = row.value;
      });
      return map;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

export const useProjects = () => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

export const useSkills = () => {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

export const useSocialLinks = () => {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};

export const useSpecializations = () => {
  return useQuery({
    queryKey: ["specializations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specializations")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });
};
