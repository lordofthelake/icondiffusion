# Icon Diffusion

An experiment for generating interface icons with Stable Diffusion.

- Demo: https://icondiffusion.vercel.app
- Model: https://huggingface.co/pskl/icondiffusion

# Prerequisites

- Node 18.x
- pnpm 8.x (`npm install -g pnpm@8`)

When using [asdf](https://asdf-vm.com/), these dependencies will just be installed for you with `asdf install`.

# Running the project

1. Install the packages

   ```console
   $ pnpm install --frozen-lockfile
   ```

2. Copy the `.env.example` file into `.env` and populate the values with your own tokens

   ```console
   $ cp .env.example .env
   ```

3. Start the application

   ```console
   $ pnpm dev
   ```
