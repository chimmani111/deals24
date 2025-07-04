
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Target, Heart, ShoppingBag, Menu, User, ChartNoAxesColumn, CommandIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const isMobile = useIsMobile();
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		const queryParam = searchParams.get('search');
		if (queryParam) {
			setSearchQuery(queryParam);
		}
	}, [location.search]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
				e.preventDefault();
				setIsSearchPopoverOpen(true);
				setTimeout(() => {
					inputRef.current?.focus();
				}, 0);
			}
		};
	
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);
	

	const handleSearch = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/deals?search=${encodeURIComponent(searchQuery.trim())}`);
			setIsSearchPopoverOpen(false);
		}
	};

	const handlePopularSearch = (query: string) => {
		setSearchQuery(query);
		navigate(`/deals?search=${encodeURIComponent(query)}`);
		setIsSearchPopoverOpen(false);
	};

	const popularSearches = [
		'AC',
		'TV',
		'LG',
		'TWS',
		'4K TV',
		'iPhone',
		'Watch',
		'MacBook',
		'Samsung',
		'T-shirt',
		'Headphones',
		'Gaming Laptop',
		'Refrigerator',
		'Washing Machine',
	];

	return (
		<header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-md border-b border-gray-200 dark:border-[#27272A]">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center">
						<Link to="/" className="flex items-center">
							{/* <Target className="h-8 w-8 mr-2" /> */}
							<img
								src="/favicon.ico"
								alt="Deals24"
								className="size-8 mr-2 rounded-full"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
									document
										.querySelector('.fallback-icon')
										?.setAttribute('style', 'display: block');
								}}
							/>
							<Target className="h-8 w-8 mr-2 fallback-icon hidden" />

							<span className="text-xl sm:text-2xl font-bold dark:text-white">Deals24</span>
						</Link>
					</div>

					<div className="flex-1 mx-4 max-w-xl">
						<form onSubmit={handleSearch} className="relative">
							<Popover
								open={isSearchPopoverOpen}
								onOpenChange={(open) => {
									setIsSearchPopoverOpen(open);
									if (open && inputRef.current) {
										setTimeout(() => {
											inputRef.current?.focus();
										}, 0);
									}
								}}>
								<PopoverTrigger asChild>
									<div className="relative">
										<Input
											ref={inputRef}
											type="text"
											placeholder={isMobile ? "Search deals..." : "Search deals... (Press Ctrl+K)"}
											className="w-full placeholder:text-[13px] text-sm sm:pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-apple-darkGray dark:bg-apple-darkGray dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											onClick={() => setIsSearchPopoverOpen(true)}
										/>
										<Search className="absolute hidden sm:block left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<Button
											type="submit"
											size="icon"
											variant="ghost"
											className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700"
											onClick={() => handleSearch()}>
											<div className="relative flex items-center justify-center h-full">
												{isMobile ? (
													<Search className="h-5 w-5" />
												) : (
													<>
														<CommandIcon className="w-3 h-3" />
														<span className="text-sm mt-0.5">K</span>
													</>
												)}
											</div>
										</Button>
									</div>
								</PopoverTrigger>
								<PopoverContent
									className="w-96 p-2 sm:w-[var(--radix-popover-trigger-width)] rounded-xl mt-1 dark:bg-apple-darkGray dark:border-gray-700"
									sideOffset={5}>
									<div className="space-y-2">
										<h3 className="text-sm font-medium text-apple-darkGray dark:text-gray-300 px-2 active:scale-95 transition-transform duration-150 ease-in-out">
											Popular searches
										</h3>
										<div className="flex flex-wrap gap-2 p-1">
											{popularSearches.map((search) => (
												<button
													key={search}
													onClick={() => handlePopularSearch(search)}
													className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded-full text-xs text-apple-darkGray dark:text-gray-200 transition-colors">
													{search}
												</button>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</form>
					</div>

					{isMobile ? (
						<div className="flex items-center gap-2">
							<ThemeToggle />
							<div className="relative p-[2px] rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-400 animate-borderMove">
							<Button
								variant="link"
								size="icon"
								className="size-8 animate-shakeLift"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
								<Menu className="h-6 w-6 text-black" />
							</Button>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link to="/deals">
								<Button
									variant="ghost"
									size="sm"
									className="hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out text-sm rounded-full dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800">
									<ShoppingBag className="h-5 w-5 mr-1" />
									<span>Deals</span>
								</Button>
							</Link>
							<Link to="/categories">
								<Button
									variant="ghost"
									size="sm"
									className="hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out text-sm rounded-full dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="h-5 w-5 mr-1">
										<rect width="7" height="7" x="3" y="3" rx="1" />
										<rect width="7" height="7" x="14" y="3" rx="1" />
										<rect width="7" height="7" x="14" y="14" rx="1" />
										<rect width="7" height="7" x="3" y="14" rx="1" />
									</svg>
									<span>Categories</span>
								</Button>
							</Link>
							<Link to="/wishlist">
								<Button
									variant="ghost"
									size="sm"
									className="hover:scale-105 active:scale-95 transition-transform duration-200 ease-in-out text-sm rounded-full dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800">
									<Heart className="h-5 w-5 mr-1" />
									<span>Wishlist</span>
								</Button>
							</Link>
							<ThemeToggle />

								{/* Glow bg */}
								<div className="relative p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
								<Link to="/admin">
									<Button
										className="rounded-full bg-white dark:bg-black dark:text-white text-black hover:bg-gray-200 dark:hover:bg-gray-800 px-4 py-2 w-full h-full animate-shakeLift">
										<User className="h-5 w-5 mr-1" />
										<ChartNoAxesColumn className="h-5 w-5 mr-1" />
									</Button>
								</Link>
								</div>
							</div>
					)}
				</div>

				{/* Mobile menu */}
				{isMobile && mobileMenuOpen && (
					<div className="py-2 border-t border-gray-200 dark:border-gray-700 animate-fade-down">
						<div className="flex flex-col space-y-2">
							<Link
								to="/deals"
								className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform duration-150 ease-in-out rounded-md flex items-center">
								<ShoppingBag className="h-5 w-5 mr-2" />
								Deals
							</Link>
							<Link
								to="/categories"
								className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform duration-150 ease-in-out rounded-md flex items-center">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="h-5 w-5 mr-2">
									<rect width="7" height="7" x="3" y="3" rx="1" />
									<rect width="7" height="7" x="14" y="3" rx="1" />
									<rect width="7" height="7" x="14" y="14" rx="1" />
									<rect width="7" height="7" x="3" y="14" rx="1" />
								</svg>
								Categories
							</Link>
							<Link
								to="/wishlist"
								className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-transform duration-150 ease-in-out rounded-md flex items-center">
								<Heart className="h-5 w-5 mr-2" />
								Wishlist
							</Link>
							<Link
								to="/admin"
								className="px-4 py-2 bg-apple-darkGray dark:bg-white text-white dark:text-black rounded-md flex items-center justify-center animate-bounce">
								<User className="h-4 pb-0.5 w-4 mr-1" />
								Admin
								<ChartNoAxesColumn className="h-4 pb-0.5 w-4 ml-1" />
							</Link>
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Navbar;
