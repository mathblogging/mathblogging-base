#!/usr/bin/perl

# USAGE
# perl csv2json.pl < input.csv > output.json

# INPUT FORMAT
# any number of lines of the form:
# feed_url,category_1,category_2,...,category_n

# OUTPUT FORMAT
# {
#   "feeds":[
#     {
#       "url": url,
#       "category": ["cat1",...]
#     }
#   ]
# }

print '{' . "\n";
print '  "feeds":[' . "\n";

my $first_iter = 1;
while ( my $row = <> ) {
    $row =~ s/\r?\n$//;   # chomp for all platforms
    my @row_values = split( /,/, $row );
    $feed_url = shift @row_values;
    @row_values = grep { $_ ne "" } @row_values;  # remove empties
    @row_values = map { "\"$_\"" } @row_values;   # quote cat names
    $categories_string = join ( ',', @row_values );

    print ",\n" unless $first_iter;               # no initial ,
    $first_iter = 0;
    print "    {\n";
    print "      \"url\": \"$feed_url\",\n";
    print "      \"category\": [$categories_string]\n";
    print "    }";
}

print "\n";
print "  ]\n";
print "}\n;"
