# Link Vault

A minimalist, powerful web application where users can save, tag, search, and organize internet links across different devices. Built with Next.js, React, Supabase, Tailwind CSS, and Shadcn UI.

## ✨ Features

*   **User Authentication:** Secure signup/login via Supabase Auth (Email/Password).
*   **Link Management (CRUD):** Add, view, edit, and delete links.
*   **Categorization:** Organize links using simple categories.
*   **Tagging:** Assign multiple tags to links for flexible organization.
*   **Filtering:** Filter links by category or tag via the sidebar.
*   **Search:** Full-text search across URL, title, description, category, and tags.
*   **Auto-Metadata Fetch:** Automatically fetches website title and favicon when adding a link.
*   **Theming:** Light/Dark mode support with system preference detection.
*   **Data Import/Export:** Import and export your links via JSON files.
*   **AI Tag Suggestions:** Get AI-powered tag suggestions based on link content.
*   **Responsive Design:** UI adapts to different screen sizes.

## 🚀 Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **UI Library:** React
*   **Styling:** Tailwind CSS
*   **Components:** Shadcn UI
*   **Backend & DB:** Supabase (Auth, Postgres)
*   **AI:** Cably AI (via API Endpoint)
*   **Notifications:** Sonner
*   **File Downloads:** file-saver

## 🔧 Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd link-vault 
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    *   Create a free Supabase project at [supabase.com](https://supabase.com/).
    *   In your project dashboard, go to the **SQL Editor**.
    *   Run the following SQL to create the `links` table:
        ```sql
        -- Create the links table
        CREATE TABLE public.links (
          id uuid NOT NULL DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL,
          url text NOT NULL,
          title text NULL,
          description text NULL,
          tags jsonb NULL DEFAULT '[]'::jsonb, -- Use jsonb for tags
          category text NULL,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now(),
          favicon_url text NULL,
          CONSTRAINT links_pkey PRIMARY KEY (id),
          CONSTRAINT links_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Enable Row Level Security (RLS)
        ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Allow individual select access" ON public.links FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Allow individual insert access" ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Allow individual update access" ON public.links FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Allow individual delete access" ON public.links FOR DELETE USING (auth.uid() = user_id);

        -- Function to handle updated_at timestamp
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger to call the function on update
        CREATE TRIGGER on_links_updated
        BEFORE UPDATE ON public.links
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
        ```
    *   Make sure Email Provider is enabled in Supabase Auth settings (usually enabled by default).

4.  **Configure Environment Variables:**
    *   Create a file named `.env.local` in the root of the project.
    *   Add your Supabase Project URL, Anon Key, and your Cably AI credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        NEXT_PUBLIC_AI_API_URL=https://meow.cablyai.com/v1/chat/completions
        NEXT_PUBLIC_AI_API_KEY=YOUR_CABLY_AI_KEY
        ```
    *   Replace `YOUR_SUPABASE_URL`, `YOUR_SUPABASE_ANON_KEY`, and `YOUR_CABLY_AI_KEY` with your actual credentials.

5.  **Configure `next/image` (Optional but Recommended):**
    *   To allow `next/image` to optimize favicons from various domains, you may need to configure `remotePatterns` in your `next.config.js` (or `next.config.mjs`) file. This can be complex to cover all potential favicon hosts.
    *   Example allowing common favicon services and general HTTP/HTTPS:
        ```js
        // next.config.js or next.config.mjs
        /** @type {import('next').NextConfig} */
        const nextConfig = {
          images: {
            remotePatterns: [
              {
                protocol: 'https',
                hostname: '**.google.com', // For google favicon service
              },
              {
                protocol: 'https',
                hostname: '**.duckduckgo.com', // For duckduckgo favicon service
              },
              {
                protocol: 'http',
                hostname: '**', // Allow any http (use with caution)
              },
                {
                protocol: 'https',
                hostname: '**', // Allow any https
              },
            ],
          },
        };

        module.exports = nextConfig;
        ```
    *   Alternatively, keep `unoptimized={true}` on the `<Image />` component in `dashboard/page.tsx` as currently implemented.

## ▶️ Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

##  Vercel Deployment

This project is configured for easy deployment on Vercel. Ensure your environment variables (Supabase keys, AI Key) are set in your Vercel project settings.
