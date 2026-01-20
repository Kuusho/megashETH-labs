#!/bin/bash

# MegaSHETH Labs - Installation Helper
# Run this script to install all dependencies

set -e

echo ""
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║                                                              ║"
echo "  ║       megaSHETH Labs - Installation Helper                   ║"
echo "  ║                                                              ║"
echo "  ║   Transaction Heatmap + Ecosystem Catalogue                  ║"
echo "  ║                                                              ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for Node.js
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"

        # Check version is 18+
        VERSION_NUM=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
        if [ "$VERSION_NUM" -lt 18 ]; then
            echo -e "${RED}✗${NC} Node.js 18+ required. Please upgrade."
            exit 1
        fi
    else
        echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
        echo "  Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check for pnpm (preferred) or npm
check_package_manager() {
    if command -v pnpm &> /dev/null; then
        PM="pnpm"
        echo -e "${GREEN}✓${NC} pnpm detected (preferred)"
    elif command -v npm &> /dev/null; then
        PM="npm"
        echo -e "${YELLOW}!${NC} Using npm (pnpm recommended for faster installs)"
        echo "  Install pnpm: npm install -g pnpm"
    else
        echo -e "${RED}✗${NC} No package manager found"
        exit 1
    fi
}

# Main installation
install_deps() {
    echo ""
    echo -e "${BLUE}Installing dependencies...${NC}"
    echo ""

    cd "$(dirname "$0")/app"

    if [ "$PM" = "pnpm" ]; then
        pnpm install
    else
        npm install
    fi

    echo ""
    echo -e "${GREEN}✓${NC} Dependencies installed successfully!"
}

# Setup environment
setup_env() {
    cd "$(dirname "$0")/app"

    if [ ! -f ".env.local" ]; then
        echo ""
        echo -e "${BLUE}Creating .env.local from template...${NC}"
        cp .env.example .env.local
        echo -e "${GREEN}✓${NC} Environment file created"
        echo ""
        echo -e "${YELLOW}!${NC} Remember to update .env.local with your API keys:"
        echo "   - NEXT_PUBLIC_ALCHEMY_API_KEY"
        echo "   - DATABASE_URL (optional for dev)"
    else
        echo -e "${GREEN}✓${NC} .env.local already exists"
    fi
}

# Run dev server
run_dev() {
    echo ""
    echo -e "${BLUE}Starting development server...${NC}"
    echo ""

    cd "$(dirname "$0")/app"

    if [ "$PM" = "pnpm" ]; then
        pnpm dev
    else
        npm run dev
    fi
}

# Interactive menu
show_menu() {
    echo ""
    echo "What would you like to do?"
    echo ""
    echo "  1) Full setup (install + env + run dev)"
    echo "  2) Install dependencies only"
    echo "  3) Run development server"
    echo "  4) Check system requirements"
    echo "  5) Exit"
    echo ""
    read -p "Select option [1-5]: " choice

    case $choice in
        1)
            check_node
            check_package_manager
            install_deps
            setup_env
            run_dev
            ;;
        2)
            check_node
            check_package_manager
            install_deps
            setup_env
            echo ""
            echo -e "${GREEN}Done!${NC} Run './install.sh' and select option 3 to start dev server."
            ;;
        3)
            check_package_manager
            run_dev
            ;;
        4)
            check_node
            check_package_manager
            echo ""
            echo -e "${GREEN}All requirements met!${NC}"
            ;;
        5)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            show_menu
            ;;
    esac
}

# Run
show_menu
